# API Routes (`src/app/api/`)

## Contrat

- Les route handlers sont des boundaries HTTP fines.
- La validation d'entrée est obligatoire pour toute route custom.
- Les routes custom appellent des services, jamais des repositories ni `db` directement.
- Le handler Better Auth sous `api/auth/[...all]` est une intégration framework :
  ne pas le modifier sauf changement explicite de Better Auth. En mode local
  boilerplate sans `DATABASE_URL`, il doit importer Better Auth paresseusement
  pour éviter de charger la DB quand `LOCAL_AUTH_ENABLED=true`.

## Sécurité

- Ne jamais retourner de stack trace, secret, connection string ou objet session brut.
- Ne jamais faire confiance aux headers client pour l'autorisation.
- Pour une route protégée, valider la session côté serveur avec `requireSession()` ou l'API Better Auth adaptée.

## Anti-contournement

- Ne pas créer une route API "temporaire" pour contourner les Server Actions, la validation Zod ou la couche service.
- Toute exception de debug doit être supprimée avant commit ou documentée avec `TODO(<ticket>)` sans secret.
