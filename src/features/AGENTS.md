# Scope

Architecture des features métier. Hérite des règles globales du root `AGENTS.md`.
Ce fichier précise les contrats locaux `actions.ts`, `service.ts`, `repository.ts`,
`schema.ts`, `types.ts` et `components/`.

# Must

- Mutations et formulaires : `UI → actions.ts → service.ts → repository.ts → lib/db`.
- Lectures serveur : `page.tsx → service.ts → repository.ts → lib/db`.
- `actions.ts` valide avec Zod, appelle `requireSession()` si protégé, délègue au service et retourne `ActionResult<T>`.
- `service.ts` porte l'orchestration métier pure et ne connaît pas Drizzle.
- `repository.ts` est le seul accès DB applicatif et retourne `T | null` pour les écritures/lectures unitaires.
- `cache.ts` porte les cache tags partagés entre actions et repositories quand nécessaire.
- `service.ts` et `repository.ts` importent `server-only`.
- Les tables métier vivent dans `features/<feature>/schema.ts` et sont exportées par `src/lib/db/schema.ts`.
- Toute évolution de schéma passe par `pnpm db:generate`, relecture SQL, puis `pnpm db:migrate`.
- Contrat d'erreurs : repository retourne `T | null`, service throw quand `null` est inattendu, action catch et traduit en `ActionResult<T>`.

# Must not

- Ne jamais importer `db` hors `repository.ts`.
- Ne jamais importer `repository.ts` depuis `page.tsx`, `actions.ts`, `service.ts` ou un composant React.
- Ne jamais déplacer une règle métier dans `actions.ts` ou `repository.ts` pour résoudre vite une erreur.
- Ne jamais modifier directement une migration déjà appliquée.
- Ne jamais réintroduire un modèle CRUD générique (`resource`, `resource_field`, `resource_record`) comme fondation durable.

# Patterns

- Copier la structure de `features/auth/` pour une nouvelle feature complète.
- Développer et éprouver une logique métier active dans `src/features/<feature>/`
  avant promotion éventuelle vers `catalog/business/<logic>/`.
- Lors d'une promotion vers le catalogue, conserver les invariants, permissions,
  rôles, workflows, schémas, tests et notes d'intégration nécessaires pour une
  greffe future sans dépendance runtime à `catalog/`.
- Config produit visible : `features/<feature>/config.ts` si assumé, pas correction cachée.
- Cache tags partagés : les exporter depuis `cache.ts`, pas depuis `repository.ts`.
- Reads repository : `"use cache"`, `cacheTag(...)`, `cacheLife(...)`.
- Mutations action : `revalidateTag(..., "max")` après écriture.
- Tests : service avec repositories mockés, actions comme boundaries, repositories avec DB mockée ou base dédiée.
- Domaine instable : préférer une feature typée minimale et jeter le code si le modèle change.
- Nouveau module dashboard : créer une feature typée et l'ajouter à la navigation déclarative.

# Checks

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm readiness`
