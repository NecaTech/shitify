# Route Login (`src/app/login/`)

## Contrat

- Route publique dédiée à l'authentification.
- Respecter le paramètre `redirect` interne posé par le proxy ou `requireSession()`.
- Ne jamais rediriger vers une URL externe fournie par l'utilisateur.

## Frontière

- La page rend des composants de feature auth.
- La logique d'auth reste dans `src/features/auth` et `src/lib/auth`.

## Anti-contournement

- Ne jamais hardcoder un compte de connexion client.
- Ne jamais contourner Better Auth avec une session factice.
