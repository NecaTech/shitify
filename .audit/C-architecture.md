# Agent C — Architecture & Layering Audit

## Verdict global

L'architecture est globalement saine et le layering est respecté dans `features/auth/`, qui sert correctement de reference implementation. Restent quelques incohérences de nommage de fichiers, un re-export feature absent, et deux écarts mineurs aux règles "no `process.env` direct" et "lib/db importé seulement dans repository".

---

## Critique (bloquant ou risque sérieux)

Aucun. Le squelette respecte le contrat documenté dans CLAUDE.md.

---

## Important (à corriger avant usage sérieux)

### 1. Nommage de fichiers de composants incohérent — kebab-case vs PascalCase

CLAUDE.md « Naming Conventions » indique explicitement :

| Files | kebab-case | user-profile.ts |

Or les composants React du boilerplate sont mélangés :

- `src/components/ui/button.tsx` — **kebab-case** (correct selon la règle, bien que le composant soit `Button`)
- `src/features/auth/components/LoginForm.tsx` — **PascalCase**
- `src/features/auth/components/RegisterForm.tsx` — **PascalCase**
- `src/features/auth/components/ProfileForm.tsx` — **PascalCase**

Deux conventions coexistent dans le même boilerplate. Comme `button.tsx` suit la règle textuelle (« Files: kebab-case »), il faut soit :

- **Option A (recommandée, conforme à la règle écrite)** : renommer en `login-form.tsx`, `register-form.tsx`, `profile-form.tsx` et adapter les imports (`src/app/login/page.tsx:3`, `src/app/register/page.tsx:3`, `src/app/(authenticated)/dashboard/page.tsx:4`).
- **Option B** : amender CLAUDE.md pour préciser « kebab-case sauf pour les composants React (PascalCase) » et renommer `button.tsx` → `Button.tsx`.

Tant que le boilerplate est une référence pour les futurs projets, cette ambiguïté va se propager.

### 2. `src/lib/db/schema.ts` n'expose pas le schema de la feature `auth`

`src/lib/db/schema.ts:1-2` :

```ts
export * from "./auth-schema";
// export * from "@/features/<feature>/schema"; // add feature schemas here
```

CLAUDE.md « Common Mistakes » dit explicitement :

> Adding a new table only to lib/db/schema.ts → Define it in the feature's schema.ts first, then re-export it from lib/db/schema.ts

`features/auth/schema.ts` re-exporte déjà `user, session, account, verification` depuis `@/lib/db/auth-schema`, mais le central `lib/db/schema.ts` re-exporte directement `auth-schema` au lieu de passer par la frontière feature. Résultat : Better Auth (`src/lib/auth/index.ts:5`) importe `* from "@/lib/db/schema"` → qui pointe vers `auth-schema` directement → **la feature `auth/schema.ts` est court-circuitée**.

Le pattern documenté serait :

```ts
// src/lib/db/schema.ts
export * from "@/features/auth/schema";
```

Sinon la feature `auth` n'illustre pas le contrat « feature owns its schema, lib/db re-exports » que les futures features sont censées suivre.

### 3. `process.env.VERCEL_URL` lu directement dans `src/lib/auth/index.ts:10-11`

```ts
if (process.env.VERCEL_URL) {
  trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
}
```

CLAUDE.md « Common Mistakes » : « Using process.env.X directly → Import from lib/env.ts ». La seule exception documentée est `drizzle.config.ts`. `VERCEL_URL` devrait être déclaré comme variable optionnelle dans `src/lib/env.ts` (server, optional) puis lue via `env.VERCEL_URL`. Sinon le boilerplate enseigne aux futures features que « bypasser env.ts pour les env vars Vercel, c'est ok ».

Note : `process.env.NODE_ENV` dans `lib/logger.ts:5-6` et `lib/db/index.ts:18` est universellement toléré (TS le type comme union littérale). Pas un blocage, mais à clarifier dans CLAUDE.md (« exception : NODE_ENV »).

### 4. `src/lib/auth/index.ts` importe `db` depuis `@/lib/db` — viole la règle « lib/db importé seulement dans repository.ts »

`src/lib/auth/index.ts:4` : `import { db } from "@/lib/db";`

CLAUDE.md « Strict Rules » : « lib/db/index.ts is only imported inside repository.ts files and migration scripts ». L'adapter Better Auth requiert l'instance `db`. C'est inévitable techniquement, mais ce n'est pas un repository et ce n'est pas un script de migration. Il faut :

- documenter l'exception dans CLAUDE.md (au même titre que `drizzle.config.ts`), ou
- créer `src/features/auth/db.ts` qui re-exporte `db` pour cette frontière feature.

Sans clarification, un futur développeur aura un précédent légitime pour importer `db` n'importe où.

---

## Recommandations (bonnes pratiques manquantes)

### R1. `src/lib/db/schema.ts` est la mauvaise source pour Better Auth

`src/lib/auth/index.ts:5` : `import * as schema from "@/lib/db/schema"` est correct pour passer le schema complet à `drizzleAdapter`. Mais combiné avec le finding #2, cela veut dire que pour ajouter un schema feature, il faut **deux** étapes : créer le schema dans la feature, puis re-exporter dans `lib/db/schema.ts`. Le commentaire `// add feature schemas here` est utile mais aucun exemple pratique n'est commité — ajouter un re-export `export * from "@/features/auth/schema"` même s'il est redondant (il deviendra le pattern à suivre) clarifierait.

### R2. `requireSession()` appelé deux fois dans le rendu d'une route protégée

Dashboard :

- `src/app/(authenticated)/layout.tsx:14` : `await requireSession();`
- `src/app/(authenticated)/dashboard/page.tsx:9` : `const session = await requireSession();`

Le commentaire du layout dit « Better Auth le met en cache au niveau de la requête » — c'est plausible mais à confirmer. Si pas de cache request-scoped → 2 round-trips DB par render. Soit :

- documenter la mise en cache (lien vers la doc Better Auth ou test), ou
- exposer `session` via `React.cache()` dans `lib/auth/server.ts` pour garantir le mémoïsation cross-component.

### R3. `features/auth/types.ts` re-exporte `ActionResult` — utilité limitée

`src/features/auth/types.ts:8` : `export type { ActionResult };` après l'avoir importé du global. L'import direct depuis `@/types/result` est tout aussi court. Et l'alias déprécié `AuthResult<T>` ligne 11 est documenté comme déprécié — pourquoi le commiter dans un boilerplate vierge ? Supprimer ces deux lignes simplifie la reference implementation.

### R4. Aucun composant dans `src/components/layout/` ni `src/hooks/`

Les dossiers existent (avec `.gitkeep`) mais aucun exemple. Pour une « reference implementation », un mini-exemple (un `Navbar` minimal, un hook `useMediaQuery`) inscrit la convention dans le code, pas seulement dans la doc. Sinon les futures features peuvent légitimement créer des composants layout ou des hooks dans des emplacements non conventionnels par défaut.

### R5. `src/app/(authenticated)/layout.tsx` ne propage pas la session

Le layout `await requireSession()` mais ne passe rien aux enfants. Toutes les pages enfants doivent ré-appeler `requireSession()` (cf. dashboard:9). Pattern alternatif : exposer un `<SessionProvider>` Server Component ou utiliser `React.cache()` côté `lib/auth/server.ts` pour transformer ces appels en mémoïsation gratuite.

### R6. Le re-export `features/auth/schema.ts` est purement cosmétique

`src/features/auth/schema.ts:5` re-exporte 4 noms du `auth-schema` généré. C'est correct comme pattern (frontière feature), mais sans aucune table custom ajoutée par la feature, ça ressemble à du code mort. Ajouter un commentaire « pattern : when this feature adds tables, define them HERE and re-export the auth tables next to them » est plus pédagogique que le commentaire actuel.

---

## Points corrects (brièvement)

- Layering `page → actions → service → repository → lib/db` respecté de bout en bout dans `features/auth/`.
- `"use server"` présent en tête de `src/features/auth/actions.ts:1`.
- `"use client"` présent dans tous les composants interactifs (`LoginForm`, `RegisterForm`, `ProfileForm`, `app/error.tsx`).
- `import "server-only"` présent dans `lib/auth/index.ts`, `lib/auth/server.ts`, `lib/db/index.ts`, `lib/db/auth-schema.ts`, `lib/logger.ts`, `features/auth/repository.ts`, `features/auth/service.ts`, `features/auth/schema.ts`.
- Validation Zod systématique dans `actions.ts` (`updateProfileSchema.safeParse`, `src/features/auth/actions.ts:20`).
- Route group `(authenticated)/` correctement utilisé pour mutualiser `requireSession()`.
- `proxy.ts` minimal et conforme à la convention Next 16 (cookie-only, validation DB déléguée à `requireSession`).
- `ActionResult<T>` centralisé dans `src/types/result.ts`, réutilisable cross-feature.
- `lib/validations/common.ts` factorise `emailSchema`, `passwordSchema`, `displayNameSchema`.
- `lib/db/index.ts` singleton via `globalForDb` correctement implémenté.
- `metadataBase` avec fallback `localhost:3000` (`src/app/layout.tsx:27`) pour CI sans env.
- Pas de business logic dans `app/` (les pages se contentent de rendre + appeler service/action).
- Aucun `console.log`/`console.error` dans le code applicatif (le seul `console.error` est dans `scripts/seed.ts`, hors-périmètre).
- Aucun import de `@/lib/db` hors `repository.ts` et `lib/auth/index.ts` (cf. finding #4).
- `auth/repository.ts` strictement data-access, sans business logic.
- `auth/service.ts` orchestre, valide l'existence avant mutation, log via Pino.

---

## Score : 7.5/10

Architecture solide et fidèle au contrat documenté pour la partie layering. Les retraits de points concernent :

- **−1.0** : convention de nommage de fichiers incohérente (PascalCase vs kebab-case dans le même boilerplate de référence) — propage le flou sur tout futur projet.
- **−0.5** : `lib/db/schema.ts` ne passe pas par `features/auth/schema.ts`, contredisant le pattern documenté.
- **−0.5** : `process.env.VERCEL_URL` lu directement dans `lib/auth/index.ts`, sans exception documentée.
- **−0.5** : `lib/db` importé hors `repository.ts` (Better Auth adapter), sans exception documentée.

Une fois ces 4 incohérences corrigées (ou explicitement documentées comme exceptions), le boilerplate mérite 9/10.
