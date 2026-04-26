# Synthèse multi-agents — NecaTech Boilerplate

**Date :** 2026-04-26  
**Méthode :** 6 agents indépendants, périmètres disjoints

---

## Scores

| Agent       | Domaine                   | Score      |
| ----------- | ------------------------- | ---------- |
| A           | Security & Auth           | 7/10       |
| B           | Next.js / Vercel Perf     | 6.5/10     |
| C           | Architecture & Layering   | 7.5/10     |
| D           | Tooling & Dependencies    | 7.5/10     |
| E           | Code Quality & TypeScript | 8.5/10     |
| F           | Drizzle ORM & Database    | 7.5/10     |
| **Moyenne** |                           | **7.4/10** |

---

## Verdict consolidé

Le boilerplate est **production-viable sur les fondamentaux** : layering respecté, TypeScript strict, ESLint + Husky configurés, Drizzle idiomatique, Better Auth correctement intégré, headers de sécurité solides. Il n'a aucun bloquant absolu. Les lacunes portent surtout sur **ce qui n'a pas encore été fait** (PPR/Suspense jamais démontré, cookies non explicitement durcis, nonce CSP manquant, WebSocket Node 20 non garanti) plutôt que sur ce qui est mal fait.

---

## Convergences fortes (≥ 3 agents indépendants)

### Tier 0 — Bloquants

Aucun. Aucun agent n'a identifié de bloquant absolu empêchant la mise en production.

### Tier 1 — Critiques (≥ 3 agents convergents)

**1. `process.env` direct dans le code applicatif sans exception documentée**  
Agents C + F + (A pour VERCEL_URL)

- `src/lib/auth/index.ts:10` — `process.env.VERCEL_URL` direct
- `src/lib/db/index.ts:18` — `process.env.NODE_ENV` direct  
  → Soit ajouter `NODE_ENV` et `VERCEL_URL` dans `lib/env.ts`, soit documenter ces deux lignes comme exceptions légales dans CLAUDE.md au même titre que `drizzle.config.ts`.

**2. `lib/db` importé hors `repository.ts` sans exception documentée**  
Agents C + F

- `src/lib/auth/index.ts:4` — `import { db } from "@/lib/db"` pour l'adapter Better Auth  
  → Exception inévitable techniquement — à documenter explicitement dans CLAUDE.md.

**3. Ordre `requireSession` / validation Zod inversé dans la reference implementation**  
Agents A + E

- `src/features/auth/actions.ts:18-19` — la session DB est vérifiée avant de valider l'input  
  → Inverser l'ordre : Zod d'abord, `requireSession` ensuite. Impact pédagogique fort car c'est le pattern copié dans tout futur projet.

### Tier 2 — Importants (≥ 2 agents convergents)

**4. Nommage de fichiers incohérent (PascalCase vs kebab-case)**  
Agent C

- `button.tsx` (kebab) vs `LoginForm.tsx` / `RegisterForm.tsx` / `ProfileForm.tsx` (Pascal)  
  → Trancher : soit renommer en `login-form.tsx` etc., soit amender CLAUDE.md avec « composants React = PascalCase ».

**5. `lib/db/schema.ts` ne passe pas par `features/auth/schema.ts`**  
Agents C + F

- `lib/db/schema.ts` re-exporte directement `auth-schema` au lieu de passer par la frontière feature  
  → Remplacer `export * from "./auth-schema"` par `export * from "@/features/auth/schema"`.

**6. `catch` muet dans `actions.ts` — erreurs non loggées**  
Agents A + E (implicitement)

- `src/features/auth/actions.ts:32-34` — catch avale tout sans `logger.error`  
  → Ajouter `logger.error({ err, userId: session.user.id }, "updateProfileAction failed")`.

**7. Zéro `<Suspense>` dans tout le projet — PPR non démontré**  
Agents B + (C pour le double `requireSession`)

- `cacheComponents: true` activé mais aucune boundary Suspense nulle part
- La home force un fetch dynamique (`getOptionalSession` au top-level) et n'est jamais CDN-cached  
  → Au minimum un `<Suspense>` dans `dashboard/page.tsx` autour de `<ProfileForm>` + un `loading.tsx`.

**8. Typage du singleton `db` perd le schema générique**  
Agent F

- `globalForDb.db?: ReturnType<typeof drizzle>` → type `NeonDatabase<Record<string, never>>`
- `db.query.user.findFirst(...)` impossible au type  
  → Typer explicitement `NeonDatabase<typeof schema>`.

**9. WebSocket non garanti sur Node 20**  
Agent F

- `engines.node: ">=20.0.0"` mais `neon-serverless` requiert WebSocket global (Node 22+)
- Pas de `ws` en dépendance → crash sur Node 20 (scripts, CI sur une vieille runner)  
  → Monter `engines.node` à `">=22.0.0"` (cohérent avec le CI qui tourne déjà Node 22).

**10. `requireEmailVerification: false` sans garde-fou runtime**  
Agent A

- Silencieux en prod → squatting d'adresse possible  
  → Ajouter un `logger.warn` quand `NODE_ENV === "production"`.

---

## Findings uniques notables (1 seul agent, fort impact)

**Agent A — `?redirect=` semi-implémenté : piège open-redirect**  
`proxy.ts` injecte `?redirect=pathname` mais `LoginForm.tsx` ignore le paramètre et redirige toujours vers `/dashboard`. Quand un dev l'implémentera sans validation, open-redirect garanti. → Soit retirer `searchParams.set("redirect", …)` du proxy, soit consommer le paramètre avec validation stricte (`target.startsWith("/") && !target.startsWith("//")`).

**Agent A — CSP `'unsafe-inline'` : protection XSS nulle**  
Le header CSP avec `script-src 'self' 'unsafe-inline'` est équivalent à pas de CSP pour les attaques XSS. Nécessite un nonce par requête généré dans `proxy.ts`. Demi-journée de travail — c'est ce qui distingue un boilerplate jouet d'un boilerplate prod-ready.

**Agent B — Home page ne sera jamais servie depuis le CDN**  
`await getOptionalSession()` au top-level de `app/page.tsx` force du dynamique sur chaque requête. Avec Vercel Fluid Compute, chaque visiteur paye un round-trip Neon (~50-200ms) avant le premier HTML.  
→ Déplacer la logique de session dans un composant async sous `<Suspense>`.

**Agent D — `@typescript-eslint/no-floating-promises` absent**  
Règle critique pour les Server Actions : un `await` oublié est un bug silencieux. → Ajouter `"@typescript-eslint/no-floating-promises": "error"` dans `eslint.config.mjs`.

**Agent D — `"jsx": "react-jsx"` au lieu de `"preserve"` dans tsconfig**  
Next.js 15+ recommande `"preserve"` pour laisser le bundler gérer la transformation JSX. → Changer dans `tsconfig.json`.

**Agent E — `<input>` natif dans `ProfileForm.tsx` au lieu du composant shadcn**  
`button.tsx` existe dans `components/ui/` mais pas `input.tsx`. La reference implementation utilise un input HTML brut → incohérence visuelle et fonctionnelle (pas d'`aria-invalid`, pas de ring de focus dark mode).  
→ `npx shadcn add input` + remplacer dans `ProfileForm.tsx`.

**Agent E — Feedback succès/erreur visuellement identique dans `ProfileForm.tsx`**  
`text-muted-foreground` pour les deux états → un user ne peut pas distinguer si l'action a réussi ou échoué.

**Agent F — `eslint-plugin-drizzle` sans `drizzleObjectName`**  
Sans option, le plugin matche tous les `.update()`/`.delete()` de n'importe quelle lib, pas seulement Drizzle. → Ajouter `{ drizzleObjectName: ["db"] }`.

**Agent F — `db:seed` entièrement vide, commenté, non illustratif**  
La reference implementation devrait au minimum avoir un seed no-op documenté ou un exemple minimal Better Auth.

---

## Tensions / Contradictions entre agents

**1. `requireSession()` dans le layout : doublon ou optimisation ?**

- Agent C note que `requireSession()` est appelé deux fois (layout + page) et suggère `React.cache()`.
- Agent B signale que le layout bloque le streaming PPR.  
  → **Verdict :** ces deux findings se renforcent. La solution correcte est d'extraire `requireSession()` dans un helper mémoïsé via `React.cache()` dans `lib/auth/server.ts`, et de le mettre sous `<Suspense>` dans le layout pour ne pas bloquer le shell statique. Les deux agents ont raison.

**2. `metadataBase` fallback : sécurité vs praticité CI**

- Agent E juge le `?? "http://localhost:3000"` superflu (Zod le garantit).
- Agent C le mentionne en ✅ (utile pour CI sans env).  
  → **Verdict :** Agent E a raison sur le fond. Le bon endroit pour le fallback est `lib/env.ts` avec `.optional().default("http://localhost:3000")` + `SKIP_ENV_VALIDATION=true` en CI (déjà documenté). Supprimer le fallback inline dans `layout.tsx`, le déclarer dans `env.ts`.

**3. `AuthResult<T>` déprécié dans la reference implementation**

- Agent C suggère de le supprimer.
- Agent E documente qu'il est correctement annoté `@deprecated`.  
  → **Verdict :** Agent C a raison. Dans un boilerplate vierge, commiter un type déprécié dans la reference implementation crée de la confusion. Supprimer `AuthResult<T>` — seul `ActionResult<T>` subsiste.

---

## Plan d'action priorisé

### 🔴 Phase 1 — Immédiat (corrections mécaniques < 1h chacune)

| #   | Fichier                              | Action                                                                               |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| 1   | `src/features/auth/actions.ts:18-19` | Inverser ordre : Zod avant `requireSession()`                                        |
| 2   | `src/features/auth/actions.ts:32`    | Ajouter `logger.error({ err }, "...")` dans le catch                                 |
| 3   | `src/lib/db/index.ts:10`             | Typer `db` en `NeonDatabase<typeof schema>`                                          |
| 4   | `package.json:engines`               | Passer `">=20.0.0"` → `">=22.0.0"`                                                   |
| 5   | `tsconfig.json`                      | `"jsx": "react-jsx"` → `"preserve"`                                                  |
| 6   | `tsconfig.json`                      | Ajouter `"exactOptionalPropertyTypes": true`                                         |
| 7   | `eslint.config.mjs`                  | Ajouter `"@typescript-eslint/no-floating-promises": "error"`                         |
| 8   | `eslint.config.mjs`                  | Ajouter `drizzleObjectName: ["db"]` aux règles Drizzle                               |
| 9   | `src/lib/db/schema.ts`               | `export * from "@/features/auth/schema"` au lieu de `./auth-schema`                  |
| 10  | `src/features/auth/types.ts`         | Supprimer `AuthResult<T>` déprécié                                                   |
| 11  | `src/app/layout.tsx:27`              | Supprimer `?? "http://localhost:3000"`, déclarer le défaut dans `env.ts`             |
| 12  | `scripts/seed.ts`                    | Supprimer `import "dotenv/config"` (doublon avec `--env-file`) + documenter le no-op |

### 🟠 Phase 2 — Court terme (< 1 journée)

| #   | Fichier                          | Action                                                                                            |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| 13  | `src/lib/auth/index.ts`          | Documenter exception `import { db }` dans CLAUDE.md                                               |
| 14  | `src/lib/auth/index.ts`          | Documenter exception `process.env.VERCEL_URL` dans CLAUDE.md + valider `.endsWith(".vercel.app")` |
| 15  | `src/lib/db/index.ts`            | Ajouter `NODE_ENV` dans `lib/env.ts` ou documenter exception                                      |
| 16  | `src/lib/auth/index.ts`          | Ajouter `useSecureCookies`, `defaultCookieAttributes` explicites                                  |
| 17  | `src/lib/auth/index.ts`          | Rate-limit sur `/reset-password`, `/verify-email`, `/change-password`                             |
| 18  | `src/lib/auth/index.ts`          | Ajouter `logger.warn` si `requireEmailVerification: false` en prod                                |
| 19  | `src/proxy.ts` + `LoginForm.tsx` | Soit supprimer `?redirect=`, soit le consommer avec validation                                    |
| 20  | Nommage fichiers composants      | Trancher PascalCase vs kebab-case + amender CLAUDE.md                                             |
| 21  | `src/features/auth/components/`  | `npx shadcn add input` + remplacer `<input>` natif dans `ProfileForm.tsx`                         |
| 22  | `ProfileForm.tsx`                | Différencier couleur feedback succès/erreur                                                       |
| 23  | `vitest.config.mts`              | Ajouter config `coverage` + script `test:coverage` dans `package.json`                            |
| 24  | `src/lib/auth/server.ts`         | Envelopper dans `React.cache()` pour éviter double round-trip                                     |

### 🟡 Phase 3 — Moyen terme (investissement conçu)

| #   | Fichier                              | Action                                                                               |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| 25  | `src/app/(authenticated)/dashboard/` | Ajouter `loading.tsx` + `<Suspense>` autour de `<ProfileForm>`                       |
| 26  | `src/app/page.tsx`                   | Extraire `getOptionalSession` dans composant async sous `<Suspense>` → home statique |
| 27  | `next.config.ts`                     | Implémenter nonce CSP dans `proxy.ts` → supprimer `'unsafe-inline'`                  |
| 28  | `next.config.ts`                     | Ajouter `experimental.typedRoutes: true`, `experimental.reactCompiler`               |
| 29  | `src/lib/db/`                        | Déclarer `relations()` Drizzle pour les tables Better Auth                           |
| 30  | `features/auth/repository.ts`        | Exposer `userTag(id)` comme constante partagée                                       |
| 31  | Fichiers de config                   | Ajouter `.nvmrc`, `.editorconfig`, `.gitattributes`, `.vscode/extensions.json`       |
| 32  | Tests                                | Ajouter `features/auth/repository.test.ts` comme test de référence                   |

---

## Critère de succès

Le boilerplate est prêt quand : aucun `process.env` direct non documenté, le layering est 100% cohérent avec CLAUDE.md (y compris les exceptions), la reference implementation démontre un `<Suspense>` PPR réel, et la CSP n'a plus de `'unsafe-inline'`.
