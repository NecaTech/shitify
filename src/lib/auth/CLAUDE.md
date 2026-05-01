# Authentification (`src/lib/auth/`)

## Structure

- `index.ts` — Configuration Better Auth (adapteur Drizzle, trusted origins, plugins). `'server-only'`.
- `server.ts` — Fonctions serveur : `requireSession()`, `getOptionalSession()`. `'server-only'`.
  - `requireAdmin()` — non fourni par le boilerplate : à implémenter selon le modèle de rôles du projet client.
- `client.ts` — Client Better Auth pour les composants React (hooks `useSession`, `signIn`, etc.).
- `../db/auth-schema.ts` — Schema genere par `@better-auth/cli`. **Ne jamais editer manuellement.**

## Fonctions serveur (`server.ts`)

- **`requireSession()`** — redirige vers `/login` si aucune session. Obligatoire dans toute page/action protégée.
- **`getOptionalSession()`** — retourne `null` sans rediriger. Pour les pages accessibles aux visiteurs mais enrichies si connecté.
- **`requireAdmin()`** — non fourni. À implémenter selon le modèle de rôles du projet (ex. vérifier `session.user.role === "admin"`).

## Règles de sécurité

- **Ne jamais se fier au proxy seul** pour l'autorisation de données. `requireSession()` est obligatoire.
- **Importer `requireSession` depuis `lib/auth/server.ts`**, pas depuis `better-auth` directement.
- **`auth.api`** est l'unique point d'entrée pour les appels Better Auth côté serveur.

## Configuration à effectuer au démarrage du projet (TODO init-project)

- **`requireEmailVerification`** — passer à `true` une fois un provider SMTP configuré (Resend, Nodemailer…).
- **`storage: "database"`** — requiert la table `rateLimit` dans le schema. Lancer `npx @better-auth/cli generate` puis `pnpm db:generate` lors de l'initialisation.
- **`trustedOrigins`** — alimenté par `BETTER_AUTH_URL` (requis). Ajouter d'autres origines si l'app est servie depuis plusieurs domaines.
- **CSP `connect-src 'self'`** — élargir dans `next.config.ts` avec les domaines réels (Neon, analytics, CDN…).

## Exceptions `process.env`

- `index.ts` : `process.env.VERCEL_URL` toléré (injecté par Vercel, indisponible au build-time).
- L'import direct `{ db }` depuis `@/lib/db` est autorisé (requis par l'adapteur Better Auth).
