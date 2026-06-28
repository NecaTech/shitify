# Feature Dashboard (`src/features/dashboard/`)

## Rôle

- Dashboard natif générique du boilerplate.
- Le Pilote est l'accueil privé accessible à `/dashboard`.
- La navigation dashboard est déclarative et prête pour des liens plats puis des groupes métier.
- Les composants dashboard rendent une structure privée sobre ; ils ne portent pas de données métier persistées.

## Frontière

- Les données réelles doivent venir de services de features dédiées.
- Ne pas connecter directement le dashboard à `db` ou aux repositories.
- Les actions futures non câblées restent cachées plutôt qu'affichées en bouton désactivé.

## Anti-contournement

- Ne jamais hardcoder une métrique client réelle pour masquer l'absence d'intégration.
- Ne jamais afficher de fausses métriques, faux membres, faux revenus ou fausse activité.
- Ne jamais réintroduire le CRUD configurable comme module natif du dashboard.
- Ne jamais employer "projet pilote" dans l'UI : voir `CONTEXT.md`.
- Si une stat devient métier, créer un service ou une feature dédiée.
