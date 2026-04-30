# Règles de la couche Core / Infrastructure (`src/lib/`)

## Règles générales de l'Infrastructure
- **Sécurité serveur :** La directive `'server-only'` est OBLIGATOIRE dans : `auth/index.ts`, `db/index.ts`, et `logger.ts`.
- **Variables d'environnement :** Toujours importer depuis `env.ts`. L'utilisation directe de `process.env.X` est STRICTEMENT INTERDITE en dehors des exceptions documentées.

## Exceptions documentées pour `process.env`
1. `db/index.ts` : `process.env.NODE_ENV` toléré (non validé par t3-env).
2. `auth/index.ts` : `process.env.VERCEL_URL` toléré (injecté par Vercel, indisponible au build-time) + import direct `{ db }` depuis `@/lib/db` (requis par l'adapter Better Auth).
3. `drizzle.config.ts` & `scripts/seed.ts` : Scripts CLI Node purs, utilisation de `process.env` autorisée car `@t3-oss/env-nextjs` n'y est pas importable.

## Base de données (`lib/db/`)
- **Isolation architecturale :** Les modules de `lib/db/` ne peuvent être importés QUE dans les fichiers `repository.ts` des features ou les scripts de migration.
- **Requêtes :** Jamais de requêtes SQL brutes (`db.execute(sql\`...\`)`) pour le CRUD. L'utilisation du Query Builder de Drizzle est obligatoire.
- **Migrations :** Ne jamais écrire de migration SQL manuellement. Toujours utiliser `drizzle-kit generate` puis `drizzle-kit migrate`.
- **Génération Auth :** Le fichier `lib/db/auth-schema.ts` est autogénéré. Ne JAMAIS l'éditer manuellement. En cas de changement, relancer : `npx @better-auth/cli generate`.

## Observabilité / Logging
- **Serveur :** Utiliser exclusivement `logger` importé de `lib/logger.ts` (Pino, server-only). Interdiction d'utiliser `console.log` en production.
- **Client :** L'utilisation de l'objet natif `console` est autorisée uniquement en développement.