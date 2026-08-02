# Feature Uploads (`src/features/uploads/`)

## Contrat

- Domaine métadonnées de fichiers uploadés uniquement.
- Le stockage binaire réel doit être configuré par provider projet (Blob, S3, R2, etc.).
- Les permissions et visibilités doivent être explicites.

## Anti-contournement

- Ne jamais stocker de fichier privé dans `public/` pour aller vite.
- Ne jamais hardcoder une URL de bucket, clé d'accès ou CDN.
