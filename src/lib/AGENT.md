# Scope

Core infrastructure (`src/lib/`) : env, auth infra, DB infra, logger, utils et
validations partagées. Hérite des règles globales du root `AGENT.md`.

# Must

- `auth/index.ts`, `db/index.ts` et `logger.ts` importent `server-only`.
- Les variables d'environnement applicatives passent par `env.ts`.
- `env.ts` centralise la validation `@t3-oss/env-nextjs`.
- `NEXT_PUBLIC_APP_URL` et `BETTER_AUTH_URL` peuvent fallback sur `VERCEL_PROJECT_PRODUCTION_URL`, puis `VERCEL_URL`.
- `auth-schema.ts` peut être importé par les `schema.ts` des features pour référencer `user`.
- Utiliser `logger` côté serveur au lieu de `console.log` en production.

# Must not

- Ne jamais coder en dur secret, URL prod, identifiant Vercel/Neon, email admin ou valeur d'environnement.
- Ne jamais ajouter une valeur de secours production codée en dur pour contourner un build.
- Ne jamais placer de logique métier dans `src/lib/`.
- Ne jamais faire de requête SQL brute pour du CRUD.

# Exceptions `process.env`

- `env.ts` : lecture centralisée des variables validées.
- `db/index.ts` : `NODE_ENV`.
- `db/schema-name.ts` : `APP_ENV`, `CLIENT_SLUG`, `PROJECT_SLUG` pour les scripts Drizzle et le runtime serveur.
- `logger.ts` : `NODE_ENV`.
- `auth/index.ts` : `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `NODE_ENV`.
- `drizzle.config.ts` et `scripts/*` : scripts Node purs, selon `scripts/AGENT.md`.

# Patterns

- DB applicative : `@/lib/db` uniquement depuis `repository.ts` ou l'adapter Better Auth.
- Config runtime : préférer une env validée ou une config projet typée.
- Auth/proxy : maintenir le contrat anti-boucle documenté dans `src/lib/auth/AGENT.md` et `src/app/AGENT.md`.

# Checks

- `pnpm readiness:static` vérifie les imports DB, `process.env` et `server-only`.
- `pnpm readiness` avant livraison.
