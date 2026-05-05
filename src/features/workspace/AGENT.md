# Feature Workspace (`src/features/workspace/`)

## Contrat

- Domaine espaces de travail, membres et rôles.
- Toute logique de permission durable doit s'appuyer sur ce modèle ou une évolution explicite.
- Les rôles doivent être déclarés et testés, pas inférés depuis un email.

## Anti-contournement

- Ne jamais hardcoder un admin via email, user id ou domaine.
- Ne jamais contourner les memberships en lisant directement `session.user`.
