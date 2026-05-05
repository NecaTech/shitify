# Routes Dashboard (`src/app/(authenticated)/dashboard/`)

## Contrat

- Routes protégées par le layout authentifié et le proxy.
- Les pages composent les données de lecture via services de features.
- Le CRUD configurable est un outil de pilote, pas un remplacement durable des features typées.

## Anti-contournement

- Ne jamais afficher une métrique, permission ou donnée client hardcodée pour masquer une intégration manquante.
- Si une page devient métier, créer ou compléter la feature correspondante avant d'ajouter de la logique dans la route.
