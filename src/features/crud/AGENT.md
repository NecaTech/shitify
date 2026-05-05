# Scope

CRUD configurable de pilotage/prototypage post-déploiement. Hérite des règles
globales et de `src/features/AGENT.md`.

# Must

- Garder les données dynamiques dans `resource`, `resource_field`, `resource_record`.
- Valider les inputs dans `actions.ts`.
- Normaliser les valeurs dans `service.ts` selon les champs définis.
- Limiter `repository.ts` aux requêtes Drizzle.
- Invalider les cache tags après mutation.

# Must not

- Ne jamais utiliser cette feature pour éviter une migration nécessaire à un domaine stable.
- Ne jamais hardcoder un champ spécial dans `CrudWorkbench`, `service.ts` ou `repository.ts`.
- Ne jamais stocker de secret, token, credential, donnée sensible ou document privé dans `resource_record.data`.
- Ne jamais faire porter une règle métier durable par du JSON dynamique.

# Patterns

- Pilot/staging : acceptable pour explorer vite un modèle client.
- Domaine stabilisé : créer `src/features/<nom>/schema.ts`, `repository.ts`, `service.ts`, `actions.ts`, `types.ts`, puis migrer les données si nécessaire.
- Champs expérimentaux : rester génériques et explicites (`label`, `key`, `type`, `isRequired`).

# Checks

- Tests d'actions/service si une règle de normalisation change.
- `pnpm readiness` avant livraison d'une évolution CRUD.
