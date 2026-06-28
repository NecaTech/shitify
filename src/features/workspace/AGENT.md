# Feature Workspace (`src/features/workspace/`)

## Contrat

- Domaine espaces de travail, membres et rôles.
- Les rôles workspace sont la hiérarchie client : `owner`, `admin`, `manager`, `staff`, `editor`, `viewer`.
- Le rôle plateforme `founder` vit sur `user.role` et reste hors membership workspace.
- Toute logique de permission durable doit s'appuyer sur ce modèle ou une évolution explicite.
- Les rôles doivent être déclarés et testés, pas inférés depuis un email.

## Anti-contournement

- Ne jamais hardcoder un admin via email, user id ou domaine.
- Ne jamais contourner les memberships en lisant directement `session.user`.
- Ne jamais permettre à un rôle workspace de supprimer, rétrograder ou modifier un `founder`.
- Ne jamais faire du founder un membre implicite de chaque workspace.
