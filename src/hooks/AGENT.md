# Hooks (`src/hooks/`)

## Contrat

- Hooks React client uniquement, réutilisables et domain-agnostic sauf sous-dossier explicitement dédié.
- Aucun accès serveur : pas de `server-only`, pas de DB, pas de service serveur.
- Les effets doivent être idempotents et nettoyés correctement.

## Anti-contournement

- Ne jamais cacher une règle métier ou une permission dans un hook client.
- Ne jamais utiliser un hook pour contourner une validation serveur.
- Les données sensibles ne doivent pas être stockées durablement dans `localStorage`.
