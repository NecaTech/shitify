# Authentification (`src/lib/auth/`)

## Structure

- `index.ts` — Configuration Better Auth (adapteur Drizzle, trusted origins, plugins). `'server-only'`.
- `server.ts` — Fonctions serveur : `requireSession()`, `getOptionalSession()`. `'server-only'`.
  - `requireAdmin()` — non fourni par le boilerplate : à implémenter selon le modèle de rôles du projet client.
- `client.ts` — Client Better Auth pour les composants React (hooks `useSession`, `signIn`, etc.).
- `../db/auth-schema.ts` — Schema genere par `@better-auth/cli`. **Ne jamais editer manuellement.**

## Regles de securite

- **`requireSession()` obligatoire** dans toute page/action protegee. Ne jamais se fier au proxy seul.
- **Importer `requireSession` depuis `lib/auth/server.ts`**, pas depuis `better-auth` directement.
- **`auth.api`** est l'unique point d'entree pour les appels Better Auth (getSession, signUp, etc.).

## Exceptions `process.env`

- `index.ts` : `process.env.VERCEL_URL` tolere (injecte par Vercel, indisponible au build-time).
- L'import direct `{ db }` depuis `@/lib/db` est autorise (requis par l'adapteur Better Auth).
