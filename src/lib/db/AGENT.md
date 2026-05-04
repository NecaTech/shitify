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

## Convention de nommage SQL

- Les tables sont en `snake_case` singulier : `workspace`, `resource_record`, `contact_submission`.
- Les colonnes de relation se terminent par `_id` : `workspace_id`, `created_by_id`.
- Les index suivent `<table>_<colonnes>_idx`.
- Les tables configurables utilisent le namespace `resource` : `resource`, `resource_field`, `resource_record`.
- Interdit : noms vagues ou temporaires (`custom_*`, `generic_*`, `data_*`, `thing_*`, `item_*` hors domaine explicite).
- Interdit : renommer une table après migration appliquée sans migration dédiée et plan de données.

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

## Évolution sans douleur

- Ajouter une table est préféré à surcharger `metadata` quand le domaine devient stable.
- Ajouter une colonne nullable ou avec `default` est le chemin standard pour enrichir une table existante.
- Rendre une colonne `not null` se fait en deux temps : backfill des données, puis migration de contrainte.
- Renommer une table, colonne, enum ou index après déploiement exige une migration dédiée et une vérification de données.
- Supprimer une colonne ou table exige une phase de dépréciation : ne plus écrire, ne plus lire, puis seulement supprimer.
- Les enums SQL sont stables : ajouter une valeur est acceptable, renommer/supprimer une valeur est une migration sensible.
- Les champs expérimentaux post-déploiement passent par `resource_field` / `resource_record`; les features stables passent par un vrai `schema.ts` typé.
- Toute nouvelle feature doit être générable par `pnpm db:generate` depuis zéro et applicable par `pnpm db:migrate` sur un projet déjà déployé.

## Frontière architecturale

- `src/lib/db/` fournit l'infrastructure.
- Les features définissent les tables métier.
- Les repositories consomment `db`.
- Les services ne connaissent pas Drizzle.
