# NecaTech Boilerplate

Production-ready Next.js fullstack starter — prêt à cloner et démarrer un projet client.

## Stack

| Couche          | Technologie                |
| --------------- | -------------------------- |
| Framework       | Next.js 16 (App Router)    |
| Langage         | TypeScript 5 (strict mode) |
| Styling         | Tailwind CSS 4             |
| ORM             | Drizzle ORM                |
| Auth            | Better Auth 1.x            |
| Validation      | Zod 4                      |
| Base de données | PostgreSQL via Neon        |
| Déploiement     | Vercel (Fluid Compute)     |
| Package manager | pnpm                       |

## Démarrage post-clonage

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env.local
```

Remplir les 4 variables dans `.env.local` :

| Variable              | Description                                |
| --------------------- | ------------------------------------------ |
| `DATABASE_URL`        | URL PostgreSQL Neon (`postgresql://...`)   |
| `BETTER_AUTH_SECRET`  | Secret aléatoire ≥ 32 caractères           |
| `BETTER_AUTH_URL`     | URL de l'app (ex. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Même URL (côté client)                     |

### 3. Générer et appliquer les migrations

```bash
pnpm db:generate
pnpm db:migrate
```

Crée les tables Better Auth (`user`, `session`, `account`, `verification`) dans votre base Neon.

### 4. Initialiser le projet via Claude Code

```
/new-project
```

Configure le nom du projet, l'URL du dépôt distant, et adapte les métadonnées du boilerplate.

### 5. Démarrer le serveur de développement

```bash
pnpm dev
```

La page d'accueil affiche le guide de démarrage tant que `src/app/page.tsx` n'a pas été remplacée par votre landing page.

---

## Structure du projet

```
src/
├── app/                        # Routing uniquement — pas de logique métier
│   ├── layout.tsx
│   ├── page.tsx                # Guide post-clonage (à remplacer)
│   ├── error.tsx               # Boundary d'erreur global ("use client")
│   ├── loading.tsx             # Boundary de chargement (active le streaming PPR)
│   └── not-found.tsx           # 404 global
├── components/
│   ├── ui/                     # Primitives UI génériques (shadcn/ui)
│   └── layout/                 # Composants de shell (Navbar, Sidebar, Footer…)
├── features/                   # Un répertoire par domaine fonctionnel
│   └── auth/                   # Implémentation de référence du pattern
│       ├── actions.ts          # Server Actions — point d'entrée depuis l'UI
│       ├── service.ts          # Logique métier — orchestre les repositories
│       ├── repository.ts       # Requêtes DB uniquement + cache
│       ├── schema.ts           # Tables Drizzle de cette feature
│       ├── types.ts            # Types TypeScript scoped
│       └── components/         # Composants React spécifiques à la feature
├── hooks/                      # React hooks réutilisables (client uniquement)
├── lib/
│   ├── auth/
│   │   ├── index.ts            # Config Better Auth serveur (server-only)
│   │   ├── client.ts           # Client Better Auth navigateur
│   │   └── server.ts           # requireSession() — à utiliser dans les pages protégées
│   ├── db/
│   │   ├── index.ts            # Instance Drizzle (singleton)
│   │   ├── auth-schema.ts      # Tables Better Auth (généré — ne pas éditer)
│   │   ├── schema.ts           # Re-exports globaux du schéma
│   │   └── migrations/         # Généré par drizzle-kit
│   ├── env.ts                  # Variables d'env validées (@t3-oss/env-nextjs + Zod)
│   ├── logger.ts               # Logger Pino (server-only)
│   └── utils.ts                # Fonctions utilitaires pures
├── proxy.ts                    # Protection des routes (cookies Better Auth)
└── types/                      # Types TypeScript globaux partagés
scripts/
└── seed.ts                     # Seeding de la base de données
```

## Flux de données

```
page.tsx → actions.ts → service.ts → repository.ts → lib/db
```

Chaque couche a une responsabilité unique. La feature `features/auth/` est l'implémentation de référence complète.

## Scripts

| Commande           | Description                             |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | Serveur de développement                |
| `pnpm build`       | Build production                        |
| `pnpm typecheck`   | Vérification TypeScript (sans émission) |
| `pnpm lint`        | ESLint                                  |
| `pnpm lint:fix`    | ESLint avec auto-fix                    |
| `pnpm format`      | Prettier                                |
| `pnpm test`        | Tests Vitest                            |
| `pnpm db:generate` | Générer les migrations Drizzle          |
| `pnpm db:migrate`  | Appliquer les migrations                |
| `pnpm db:push`     | Push direct du schéma (dev uniquement)  |
| `pnpm db:studio`   | Interface Drizzle Studio                |
| `pnpm db:seed`     | Seeder la base de données               |

## Règles clés

- **Jamais de `process.env.X` direct** — importer depuis `lib/env.ts`
- **Jamais de saut de couche** — `page.tsx` ne peut pas appeler un repository directement
- **`requireSession()`** dans toutes les pages/actions protégées (ne pas se fier au proxy seul)
- **`'use cache'` + `cacheTag`** sur les fonctions read des repositories (Next 16)
- **`server-only`** dans `lib/auth/index.ts`, `lib/db/index.ts`, `lib/logger.ts`

Voir `CLAUDE.md` pour les règles complètes.

## License

MIT
