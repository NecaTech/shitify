# Agent F — Drizzle ORM & Database Audit

## Verdict global (2 phrases max)

Le socle Drizzle/Neon est globalement sain et idiomatique : driver `neon-serverless` correctement choisi pour Vercel Fluid Compute, singleton pool propre, schema bien re-exporté, queries idiomatiques sans raw SQL, et garde-fous ESLint actifs. Trois points méritent attention avant usage sérieux : le typage du singleton `db` (perte du `schema` dans le type inféré), le pool exposé sans `globalThis.WebSocket` ni `neonConfig` explicite (relations Drizzle non testables et `db.query` non disponible), et le seed encore vide.

---

## ❌ Critique (bloquant ou risque sérieux)

Aucun finding critique. La couche DB est suffisamment propre pour partir en production une fois les avertissements ci-dessous traités.

---

## ⚠️ Important (à corriger avant usage sérieux)

### 1. `src/lib/db/index.ts:10` — type `db` perd le `schema` générique

```ts
db?: ReturnType<typeof drizzle>;
```

`ReturnType<typeof drizzle>` n'est PAS paramétré avec `typeof schema`, donc le type inféré du `db` global est `NeonDatabase<Record<string, never>>`. Conséquence : `db.query.user.findFirst(...)` n'existera jamais sur le type. Tant que tout le monde utilise `db.select()` (cas actuel) ce n'est pas bloquant, mais dès qu'un développeur tentera l'API relations queries (`db.query.<table>`), il aura `Property 'user' does not exist on type 'never'`.

**Correction :**

```ts
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: NeonDatabase<typeof schema>;
};
```

avec `import type { NeonDatabase } from "drizzle-orm/neon-serverless";`. Idem, ajouter une annotation explicite sur `db` :

```ts
export const db: NeonDatabase<typeof schema> =
  globalForDb.db ?? drizzle(pool, { schema });
```

Cela évite aussi tout drift silencieux si `drizzle-orm` change la signature de `drizzle()`.

### 2. `src/lib/db/index.ts:2-3` — `neon-serverless` sans configuration WebSocket explicite

Le driver `neon-serverless` utilise WebSocket pour le pool. En environnement Node (build, scripts, tests Vitest avec `jsdom`), il faut soit :

- être sur Node ≥ 22 (WebSocket global natif), ce que `engines.node: ">=20.0.0"` (`package.json:8`) **n'impose pas** — un dev sur Node 20 cassera silencieusement les requêtes hors Vercel ;
- soit configurer explicitement `neonConfig.webSocketConstructor = ws` avec la dépendance `ws`.

`ws` n'est **pas** dans `package.json` (dependencies/devDependencies). Sur Vercel Fluid Compute (Node 22) ça marche, mais :

- `pnpm test` (Vitest) ou `pnpm db:seed` sur une machine en Node 20 va échouer avec `WebSocket is not defined`.
- Le contrat `engines: ">=20.0.0"` est donc menteur.

**Correction au choix :**

- **A (recommandé pour rester serverless‑first)** : passer `engines.node` à `">=22.0.0"` dans `package.json` et ajouter un commentaire en tête de `index.ts` indiquant que Node 22+ est requis.
- **B** : ajouter `ws` en dependency et configurer explicitement :
  ```ts
  import { Pool, neonConfig } from "@neondatabase/serverless";
  import ws from "ws";
  if (typeof WebSocket === "undefined") neonConfig.webSocketConstructor = ws;
  ```

### 3. `src/lib/db/index.ts:13-21` — pool partagé en prod : pas de `pool.end()` ni `allowExitOnIdle`

En contexte Vercel Fluid Compute, le `Pool` `neon-serverless` reste actif entre invocations. Sans `allowExitOnIdle: true`, dans certains scénarios (scripts de migration tournant via `tsx`, jobs cron Node), le process ne quitte jamais car le pool retient le loop. Le `scripts/seed.ts` appelle déjà `pool.end()` ce qui montre que le souci est connu — mais le pool exporté de `lib/db/index.ts` n'a pas de stratégie comparable.

**Correction :**

```ts
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    // évite les processes zombies quand utilisé hors Vercel (scripts, tests)
    ...(process.env.NODE_ENV !== "production" ? { allowExitOnIdle: true } : {}),
  });
```

### 4. `scripts/seed.ts:13-27` — seed entièrement vide et commenté, sans utilité réelle

Le script charge `dotenv`, instancie un `Pool`, … et ne fait rien (corps `main()` ne contient que `await pool.end()`). Le commentaire `// const db = drizzle(...) ` est trompeur car les tables Better Auth existent bel et bien (`auth-schema.ts`). Pour un boilerplate qui se présente comme « reference implementation », au minimum un seed exemple insérant un user de dev (avec `crypto.randomUUID()`, `email_verified: false`, `password` hash via Better Auth) ou explicitement no-op documenté avec un message console.

**Correction minimale :**

```ts
async function main() {
  // Aucun seed par défaut. Décommenter et adapter selon votre domaine.
  console.log("[seed] no-op — boilerplate seed not yet customized");
  await pool.end();
}
```

Et supprimer les `import` commentés (ou les laisser actifs et ne plus exporter `db`).

### 5. `src/lib/db/index.ts:18` — accès direct `process.env.NODE_ENV` au lieu de `env`

Mineure mais cohérence : `env.ts` ne valide pas `NODE_ENV`. CLAUDE.md interdit `process.env.X` hors exception documentée. Soit ajouter `NODE_ENV: z.enum(["development","test","production"]).default("development")` dans `env.ts` (et l'utiliser ici), soit documenter cette ligne comme exception. En l'état, c'est silencieusement contradictoire avec la règle « Never use `process.env.X!` ».

---

## 💡 Recommandations (bonnes pratiques manquantes)

### R1. `eslint.config.mjs:14` — config `eslint-plugin-drizzle` incomplète

Les règles `enforce-delete-with-where` / `enforce-update-with-where` sont activées mais sans option `drizzleObjectName` :

```ts
"drizzle/enforce-delete-with-where": ["error", { drizzleObjectName: ["db"] }],
"drizzle/enforce-update-with-where": ["error", { drizzleObjectName: ["db"] }],
```

Sans cette option, le plugin matche **tout** `.update()`/`.delete()` y compris ceux d'autres libs (zod, etc.) et peut laisser passer des cas légitimes ou en faux-positiver d'autres. À ajouter.

### R2. Pas de `relations()` Drizzle déclarées

`auth-schema.ts` définit les FK (`user.id ← session.userId`, `user.id ← account.userId`) mais aucune `relations()` n'est exportée. Conséquence : impossible d'utiliser `db.query.user.findFirst({ with: { sessions: true } })`. Pour un fichier marqué « do not edit manually », on peut au moins ajouter un `relations.ts` séparé, ou un commentaire indiquant que les relations doivent être déclarées par feature si besoin. Sans ça, le boilerplate impose implicitement de ne jamais utiliser l'API relations queries — ce qui est dommage vu que `{ schema }` est passé à `drizzle()`.

### R3. `auth-schema.ts:50-51` — colonnes `verification.createdAt/updatedAt` non `notNull`

Toutes les autres tables ont `createdAt/updatedAt` en `notNull().defaultNow()` ; `verification` les a sans `notNull`. C'est l'output brut de `@better-auth/cli generate` mais c'est incohérent et nullité non utile. Si Better Auth est mis à jour et que la regénération produit autre chose, OK ; sinon, harmoniser :

```ts
createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow(),
```

### R4. `src/lib/db/migrations/` vide (juste `.gitkeep`)

Documenté comme intentionnel — soit. Mais conséquence concrète : `pnpm db:migrate` au premier déploiement Vercel **échoue** car le dossier `migrations` ne contient pas de `meta/_journal.json`. Le `README` ou un `MIGRATIONS.md` devrait expliciter la séquence d'init :

```
pnpm db:generate   # crée la première migration depuis auth-schema.ts
pnpm db:migrate    # applique
git add src/lib/db/migrations && git commit
```

Sinon le premier dev qui clone fait `pnpm db:migrate` directement et obtient une erreur cryptique.

### R5. `drizzle.config.ts` — bonus : ajouter `migrations.prefix`

Pour des migrations plus lisibles (`0001_xxx.sql` → `2026-04-26T120000_xxx.sql`), considérer :

```ts
migrations: {
  prefix: "timestamp",
},
```

Optionnel — purement question de goût et de lisibilité de l'historique.

### R6. `features/auth/repository.ts` — `updateUser` ne `revalidate` rien

`updateUser` est appelé depuis `service.updateUserProfile`, et l'invalidation `revalidateTag(\`user:${id}\`, "default")` est faite dans l'**action** (`actions.ts:30`). Architecturalement OK, mais cela signifie que toute autre action mutant `user`devra **systématiquement** se rappeler du tag. Pattern plus robuste : exposer une constante du type`userTag(id)` depuis le repository et l'importer côté action :

```ts
// repository.ts
export const userTag = (id: string) => `user:${id}`;
```

Évite les typos et garantit la cohérence read/write.

### R7. `scripts/seed.ts` — `--env-file` (Node 20+) + `dotenv/config` font doublon

`package.json:23` : `"db:seed": "tsx --env-file=.env.local scripts/seed.ts"`. `seed.ts:11` : `import "dotenv/config"`. L'un suffit. Garder `--env-file` (natif, plus rapide, pas de dep) et supprimer `import "dotenv/config"`.

### R8. Absence de tests sur la couche repository

Aucun fichier `*.test.ts` dans `features/auth/`. Vitest est installé. Au minimum un test smoke `repository.test.ts` mockant `db` (vi.mock("@/lib/db")) garantirait la non-régression sur les queries. Référence implementation = devrait inclure un test de référence.

---

## ✅ Points corrects (brièvement)

- Driver `neon-serverless` correctement choisi (vs `neon-http`) — nécessaire pour le pool, sessions, transactions et compatibilité Drizzle complète sur Vercel Fluid Compute.
- Singleton pool/db via `globalThis` proprement gardé en dev (`NODE_ENV !== "production"`), évite la prolifération de connexions au hot-reload.
- `import "server-only"` présent dans `lib/db/index.ts:1` et `lib/db/auth-schema.ts:1`.
- `{ schema }` correctement passé au constructeur `drizzle(pool, { schema })` (`lib/db/index.ts:16`) — base saine pour activer les relations queries.
- `lib/db/schema.ts` re-export central — pattern correct, prêt pour l'ajout des features (`export * from "@/features/<feature>/schema"`).
- `drizzle.config.ts` : `casing: "snake_case"`, `verbose: true`, `strict: true`, dotenv chargé dans le bon ordre (`.env.local` puis `.env`), garde-fou `if (!databaseUrl) throw`.
- `features/auth/repository.ts` : queries Drizzle 100% idiomatiques, aucune `db.execute(sql\`...\`)`, `update().set().where().returning()`propre,`eq()` typé.
- `findUserByEmail` normalise `.toLowerCase()` — robuste contre les saisies majuscules.
- `eq(user.id, id)` toujours présent sur `update`/`delete` — protégé par `eslint-plugin-drizzle`.
- Better Auth utilise `drizzleAdapter(db, { provider: "pg", schema })` (`lib/auth/index.ts:18-21`) — provider correct, schema partagé avec Drizzle.
- `User = InferSelectModel<typeof user>` dans `features/auth/types.ts:5` — typage idiomatique Drizzle, pas de duplication manuelle.
- `eslint-plugin-drizzle` actif avec `enforce-delete-with-where` / `enforce-update-with-where` — garde-fou anti-DROP-table.

---

## Score : 7.5/10

Solide socle Drizzle/Neon, choix de driver et patterns architecturaux corrects. Perd des points sur (1) le typage du singleton qui casse l'API `db.query`, (2) l'absence de garantie WebSocket Node 20, (3) un seed vide qui n'illustre rien, (4) la config `eslint-plugin-drizzle` sans `drizzleObjectName`, et (5) l'absence de relations() et de tests. Aucun bug bloquant en production sur Vercel Fluid Compute, mais plusieurs frictions évitables pour le premier dev qui adopte le boilerplate.
