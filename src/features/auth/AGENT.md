# Feature Auth (`src/features/auth/`)

## Rôle

- Feature de référence pour le flux `actions → service → repository`.
- Gère le profil utilisateur applicatif, pas la configuration Better Auth globale.
- Les tables Better Auth restent dans `src/lib/db/auth-schema.ts`.
- Le rôle plateforme minimal est `founder | user`; il ne remplace pas les rôles workspace.

## Frontière

- `actions.ts` valide les inputs, appelle `requireSession()` si protégé, puis délègue au service.
- `service.ts` porte les règles métier utilisateur.
- `repository.ts` accède à Drizzle et expose les cache tags utilisateur.
- Les composants auth ne doivent pas importer de repository ni de service serveur directement.

## Anti-contournement

- Ne jamais hardcoder un utilisateur founder/admin, un email privilégié ou un rôle implicite dans cette feature.
- Ne jamais contourner Better Auth en écrivant directement des cookies/session depuis une action.
- Ne jamais créer de hiérarchie globale `admin/manager/staff/editor/viewer` dans `user.role`.
- Les rôles client restent dans `workspace_membership`.
