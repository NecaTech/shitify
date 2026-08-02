# Layout Components (`src/components/layout/`)

## Contrat

- Composants de structure transverses : header, sidebar, footer, nav shell.
- Domain-agnostic par défaut ; toute donnée métier doit être passée par props.
- Aucun accès direct à la DB, aux repositories ou aux services.

## Auth

- Les layouts visuels ne décident pas de l'autorisation.
- La protection reste dans `src/app/(backoffice)` et `src/lib/auth/server.ts`.

## Anti-contournement

- Ne jamais masquer ou afficher une navigation privilégiée via rôle hardcodé.
- Si une navigation dépend des permissions, passer un modèle de navigation déjà calculé par la couche app/service.
