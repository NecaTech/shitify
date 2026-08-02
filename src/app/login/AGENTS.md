# Route Login (`src/app/login/`)

## Contrat

- Route publique dédiée à l'authentification.
- Respecter le paramètre `redirect` interne posé par le proxy ou `requireSession()`.
- Le boilerplate peut utiliser l'auth locale signée quand `LOCAL_AUTH_ENABLED=true`
  hors production, afin d'ouvrir `/dashboard` sans DB client.
- Ne jamais rediriger vers une URL externe fournie par l'utilisateur.

## Frontière

- La page rend des composants de feature auth.
- La logique d'auth reste dans `src/features/auth` et `src/lib/auth`.

## Anti-contournement

- Ne jamais hardcoder un compte de connexion client.
- Ne jamais contourner Better Auth avec une session factice hors exception locale
  boilerplate documentée dans `src/lib/auth/AGENTS.md`.
