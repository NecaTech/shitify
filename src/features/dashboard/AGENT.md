# Feature Dashboard (`src/features/dashboard/`)

## Rôle

- Dashboard configurable pour adapter rapidement un projet pilote.
- `config.ts` porte le contenu de présentation, les stats et les actions affichées.
- Les composants rendent la configuration ; ils ne décident pas de données métier persistées.

## Frontière

- Les valeurs de démo assumées vont dans `config.ts`.
- Les données réelles doivent venir de services de features dédiées.
- Ne pas connecter directement le dashboard à `db` ou aux repositories.

## Anti-contournement

- Ne jamais hardcoder une métrique client réelle pour masquer l'absence d'intégration.
- Si une stat devient métier, créer un service ou une feature dédiée.
