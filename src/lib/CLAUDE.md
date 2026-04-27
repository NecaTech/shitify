# lib/

## Règles générales

- `server-only` obligatoire dans : `auth/index.ts`, `db/index.ts`, `logger.ts`
- Toujours importer les variables d'env depuis `env.ts` — jamais `process.env.X` directement

## Exceptions process.env documentées (intentionnelles)

- `db/index.ts` → `process.env.NODE_ENV` uniquement (non validé par t3-env)
- `auth/index.ts` → `process.env.VERCEL_URL` (injecté par Vercel, indisponible à la validation build-time) + import direct `{ db }` depuis `@/lib/db` (requis par l'adapter Better Auth)
- `drizzle.config.ts` et `scripts/seed.ts` → scripts CLI Node purs, `@t3-oss/env-nextjs` non importable

## Database

- `lib/db/auth-schema.ts` est généré — ne pas éditer. Regénérer avec `npx @better-auth/cli generate`
- Toujours `drizzle-kit generate` + `drizzle-kit migrate` — jamais de SQL migration manuel
- Jamais `db.execute(sql\`...\`)` pour du CRUD — utiliser le query builder Drizzle
- `lib/db` importé uniquement dans `repository.ts` et migrations

## Logging

- `logger` depuis `lib/logger.ts` (Pino, server-only) — jamais `console.log` en prod
- Côté client : `console` directement en dev
