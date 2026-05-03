# Base de données (`src/lib/db/`)

## Structure

- `index.ts` — Instance Drizzle + connexion Neon. `'server-only'`.
- `schema.ts` — Point d'entrée agrégé des schémas Drizzle.
- `auth-schema.ts` — Schéma Better Auth généré. Ne jamais éditer manuellement.
- `migrations/` — Migrations générées par Drizzle Kit.

## Règles

- Importer `db` uniquement depuis les `repository.ts` des features.
- Déclarer chaque nouveau schéma feature dans `schema.ts`.
- Générer les migrations avec `pnpm db:generate`.
- Appliquer les migrations avec `pnpm db:migrate`.
- Utiliser exclusivement le query builder Drizzle pour le CRUD.
- Garder les tables métier dans `src/features/<feature>/schema.ts`.

## Interdictions

- Ne jamais importer `db` dans `page.tsx`, `actions.ts`, `service.ts` ou un composant React.
- Ne jamais écrire de migration SQL manuellement.
- Ne jamais modifier `auth-schema.ts` à la main.
- Ne jamais faire de requête SQL brute pour du CRUD.
- Ne jamais placer de logique métier dans `src/lib/db/`.

## Better Auth

- Régénérer `auth-schema.ts` avec `npx @better-auth/cli generate` après tout changement de configuration Better Auth impactant le schéma.
- Vérifier que les tables Better Auth générées sont exportées via `schema.ts`.
- La table `rateLimit` doit être présente si `rateLimit.storage = "database"`.

## Migrations

- Toute modification de schéma doit produire une migration.
- Toute migration générée doit être relue avant commit.
- `db:push` est autorisé uniquement en développement local.
- `db:push` est interdit pour une base de staging ou production.

## Frontière architecturale

- `src/lib/db/` fournit l'infrastructure.
- Les features définissent les tables métier.
- Les repositories consomment `db`.
- Les services ne connaissent pas Drizzle.
