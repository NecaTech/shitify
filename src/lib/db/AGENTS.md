# Scope

Infrastructure base de données : instance Drizzle/Neon, schéma agrégé,
namespace PostgreSQL applicatif, schéma Better Auth généré puis transformé,
et migrations. Hérite du root `AGENTS.md` et de `src/lib/AGENTS.md`.

# Must

- Déclarer chaque nouveau schéma feature dans `schema.ts`.
- Dans le boilerplate générique, garder `src/lib/db/migrations/` vide hors `.gitkeep`.
- Après `pnpm init-project`, générer la baseline du projet client avec `pnpm db:generate`.
- Appliquer les migrations avec `pnpm db:migrate`.
- Relire toute migration générée avant commit.
- Garder les tables métier dans `src/features/<feature>/schema.ts`.
- Déclarer les tables applicatives avec `appSchema.table(...)` et les enums avec `appSchema.enum(...)`.
- Régénérer le schéma Better Auth avec `pnpm auth:generate` si la config Better Auth impacte les tables.
- Garder `auth-schema.generated.ts` comme sortie brute Better Auth et `auth-schema.ts` comme sortie transformée schema-aware.
- Les tables Better Auth actives doivent utiliser `appSchema.table(...)`, pas `pgTable(...)`.

# Must not

- Ne jamais importer `db` dans `page.tsx`, `actions.ts`, `service.ts` ou un composant React.
- Ne jamais écrire de migration SQL manuellement.
- Ne jamais committer une baseline Drizzle figée sur un schema arbitraire depuis le boilerplate.
- Ne jamais créer de table, enum ou FK applicative dans `public`.
- Ne jamais modifier `auth-schema.generated.ts` ou `auth-schema.ts` à la main ; modifier le workflow `auth:generate` si nécessaire.
- Ne jamais importer `auth-schema.generated.ts` depuis le code applicatif.
- Ne jamais placer de logique métier dans `src/lib/db/`.
- Ne jamais utiliser `db:push` sur staging, production ou DB partagée pilot/staging.

# Patterns

- Tables SQL : singulier `snake_case`.
- Colonnes de relation : suffixe `_id`.
- Index : `<table>_<colonnes>_idx`.
- Ne pas ajouter de nouveau namespace CRUD générique. Les modules durables passent par des features typées.
- Évolution compatible : ajouter table, colonne nullable/default, backfill avant `not null`.
- Suppression : phase de dépréciation, arrêt lecture/écriture, puis migration.
- Better Auth : `auth-schema.generated.ts` est la sortie brute du CLI ; `auth-schema.ts`
  conserve les mêmes exports publics (`user`, `session`, `account`, `verification`,
  `rateLimit`) après transformation vers le schema PostgreSQL applicatif.
- Baseline Drizzle : Option A. Les migrations sont générées par projet après
  `init-project`, car Drizzle écrit le nom concret du schema PostgreSQL dans les
  fichiers SQL et snapshots.

# Checks

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:check`
- `pnpm auth:generate`
- `pnpm readiness`
