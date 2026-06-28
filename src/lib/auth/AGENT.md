# Authentification (`src/lib/auth/`)

## Structure

- `index.ts` — Configuration Better Auth (adapteur Drizzle, trusted origins, plugins). `'server-only'`.
- `server.ts` — Fonctions serveur : `requireSession()`, `getOptionalSession()`. `'server-only'`.
  - Les guards founder/workspace doivent respecter `docs/adr/0002-founder-is-platform-authority.md`.
- `client.ts` — Client Better Auth pour les composants React (hooks `useSession`, `signIn`, etc.).
- `local.ts` — Session locale signée pour ouvrir le dashboard du boilerplate sans
  DB client. Autorisée uniquement avec `LOCAL_AUTH_ENABLED=true` hors production.
- `../db/auth-schema.generated.ts` — sortie brute Better Auth CLI. **Ne jamais importer dans l'app ni éditer manuellement.**
- `../db/auth-schema.ts` — sortie transformée schema-aware utilisée par l'app et l'adapter Drizzle. **Ne jamais éditer manuellement.**

## Fonctions serveur (`server.ts`)

- **`requireSession()`** — redirige vers `/login` si aucune session. Obligatoire dans toute page/action protégée.
- **`getOptionalSession()`** — retourne `null` sans rediriger. Pour les pages accessibles aux visiteurs mais enrichies si connecté.
- **Founder** — autorité plateforme globale. Ne pas assimiler à un admin client.
- **Workspace roles** — autorité client portée par `workspace_membership`.

## Règles de sécurité

- **Ne jamais se fier au proxy seul** pour l'autorisation de données. `requireSession()` est obligatoire.
- **Importer `requireSession` depuis `lib/auth/server.ts`**, pas depuis `better-auth` directement.
- **`auth.api`** est l'unique point d'entrée pour les appels Better Auth côté serveur.
- **Auth locale boilerplate** — exception bornée : en développement uniquement,
  `LOCAL_AUTH_ENABLED=true` peut utiliser `FOUNDER_EMAIL`,
  `FOUNDER_NAME` et `FOUNDER_INITIAL_PASSWORD` pour créer une session signée
  sans DB. Ne pas utiliser pour un projet client, staging ou production.
- Ne jamais inférer un founder depuis un email, user id ou domaine.
- Les rôles workspace ne modifient jamais `user.role`.

## Configuration à effectuer au démarrage du projet (TODO init-project)

- **`requireEmailVerification`** — passer à `true` une fois un provider SMTP configuré (Resend, Nodemailer…).
- **`storage: "database"`** — requiert la table `rateLimit` dans le schema. Lancer `pnpm auth:generate` puis `pnpm db:generate` lors de l'initialisation ou après un changement Better Auth qui impacte les tables.
- **`trustedOrigins`** — alimenté par `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` et les variables système Vercel. Ajouter d'autres origines si l'app est servie depuis plusieurs domaines.
- **CSP `connect-src 'self'`** — élargir dans `next.config.ts` avec les domaines réels (Neon, analytics, CDN…).

## Exceptions `process.env`

- `index.ts` : `process.env.VERCEL_URL`, `process.env.VERCEL_PROJECT_PRODUCTION_URL` et `process.env.NODE_ENV` tolérés pour les origins Vercel et localhost hors production.
- L'import direct `{ db }` depuis `@/lib/db` est autorisé (requis par l'adapteur Better Auth).
