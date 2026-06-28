# Routes Dashboard (`src/app/(authenticated)/dashboard/`)

## Contrat

- Routes protégées par le layout authentifié et le proxy.
- `/dashboard` est la page Pilote canonique et ne redirige pas vers `/dashboard/pilote`.
- Le layout dashboard porte le chrome privé : sidebar desktop, bottom nav mobile et header compact utile.
- Les pages composent les données de lecture via services de features.
- Les sections futures du dashboard passent par des routes dédiées et des features typées.

## Anti-contournement

- Ne jamais afficher une métrique, permission ou donnée client hardcodée pour masquer une intégration manquante.
- Ne jamais réintroduire `/dashboard/crud` comme fondation native du dashboard.
- Ne jamais utiliser "projet pilote" dans l'UI du dashboard boilerplate : Pilote désigne l'accueil dashboard.
- Ne pas créer `/dashboard/pilote` sans nouvelle décision explicite.
- Si une page devient métier, créer ou compléter la feature correspondante avant d'ajouter de la logique dans la route.
