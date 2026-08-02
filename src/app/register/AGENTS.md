# Route Register (`src/app/register/`)

## Contrat

- Route publique dédiée à l'inscription.
- Les règles de validation et de création de compte restent dans Better Auth / feature auth.
- Après ajout d'un provider email, synchroniser cette route avec `requireEmailVerification`.

## Anti-contournement

- Ne jamais désactiver une validation d'inscription dans la page pour contourner une erreur UX.
- Ne jamais hardcoder de domaine email, rôle ou statut privilégié sans règle métier documentée.
