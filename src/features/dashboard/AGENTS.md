# Feature Dashboard (`src/features/dashboard/`)

## Rôle

- Dashboard natif générique du boilerplate.
- Le Pilote est l'accueil privé accessible à `/dashboard`.
- Dans le boilerplate source, le dashboard Founder sert à tester et maturer le
  socle localement : invariants réutilisables, rôles, permissions, garde-fous et
  surfaces génériques.
- Le dashboard Founder du boilerplate ne prépare pas une livraison client ; les
  phases staging/prod appartiennent uniquement aux projets clients créés depuis
  le template.
- La navigation dashboard est déclarative et prête pour des liens plats puis des groupes métier.
- Les composants dashboard rendent une structure privée sobre ; ils ne portent pas de données métier persistées.

## Frontière

- Les données réelles doivent venir de services de features dédiées.
- Ne pas connecter directement le dashboard à `db` ou aux repositories.
- Les actions futures non câblées restent cachées plutôt qu'affichées en bouton désactivé.
- Toute UI de progression staging/prod doit être réservée au mode projet client,
  pas au dashboard du boilerplate source.

## Anti-contournement

- Ne jamais hardcoder une métrique client réelle pour masquer l'absence d'intégration.
- Ne jamais afficher de fausses métriques, faux membres, faux revenus ou fausse activité.
- Ne jamais réintroduire le CRUD configurable comme module natif du dashboard.
- Ne jamais employer "projet pilote" dans l'UI : voir `CONTEXT.md`.
- Ne jamais présenter le boilerplate source comme une instance livrable en
  staging ou production.
- Si une stat devient métier, créer un service ou une feature dédiée.
