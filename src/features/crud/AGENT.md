# Feature CRUD Configurable (`src/features/crud/`)

## Rôle

- Outil de pilote post-déploiement pour modéliser rapidement des ressources métier.
- Les données dynamiques vivent dans `resource`, `resource_field`, `resource_record`.
- Quand un domaine devient stable, migrer vers une vraie feature typée.

## Frontière

- Les champs dynamiques restent configurables ; ne pas y enfouir une logique métier durable.
- Les actions valident les inputs et invalident les tags.
- Le service normalise les valeurs selon les champs définis.
- Le repository reste limité aux requêtes Drizzle.

## Anti-contournement

- Ne jamais utiliser le CRUD configurable pour éviter de créer une migration nécessaire à un domaine stable.
- Ne jamais hardcoder un champ spécial dans `CrudWorkbench`, `service.ts` ou `repository.ts`.
- Ne jamais stocker de secret ou donnée sensible dans `resource_record.data`.
