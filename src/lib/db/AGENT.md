# Scope

Infrastructure base de données : instance Drizzle/Neon, schéma agrégé,
schéma Better Auth généré et migrations. Hérite du root `AGENT.md` et de
`src/lib/AGENT.md`.

# Must

- Déclarer chaque nouveau schéma feature dans `schema.ts`.
- Générer les migrations avec `pnpm db:generate`.
- Appliquer les migrations avec `pnpm db:migrate`.
- Relire toute migration générée avant commit.
- Garder les tables métier dans `src/features/<feature>/schema.ts`.
- Régénérer `auth-schema.ts` avec `npx @better-auth/cli generate` si la config Better Auth impacte le schéma.

# Must not

- Ne jamais importer `db` dans `page.tsx`, `actions.ts`, `service.ts` ou un composant React.
- Ne jamais écrire de migration SQL manuellement.
- Ne jamais modifier `auth-schema.ts` à la main.
- Ne jamais placer de logique métier dans `src/lib/db/`.
- Ne jamais utiliser `db:push` sur staging, production ou DB partagée pilot/staging.

# Patterns

- Tables SQL : singulier `snake_case`.
- Colonnes de relation : suffixe `_id`.
- Index : `<table>_<colonnes>_idx`.
- Tables configurables : namespace `resource`, `resource_field`, `resource_record`.
- Évolution compatible : ajouter table, colonne nullable/default, backfill avant `not null`.
- Suppression : phase de dépréciation, arrêt lecture/écriture, puis migration.

# Checks

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:check`
- `pnpm readiness`
