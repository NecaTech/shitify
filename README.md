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

Remplir les variables dans `.env.local` :

| Variable              | Obligatoire | Description                                                  |
| --------------------- | ----------- | ------------------------------------------------------------ |
| `DATABASE_URL`        | Oui         | URL PostgreSQL Neon (pooled, `postgresql://...`)             |
| `BETTER_AUTH_SECRET`  | Oui         | Secret aléatoire ≥ 32 car. (`openssl rand -base64 32`)       |
| `BETTER_AUTH_URL`     | Oui         | URL publique de l'app — conditionne `trustedOrigins`         |
| `NEXT_PUBLIC_APP_URL` | Non         | Même URL (métadonnées OG). Default : `http://localhost:3000` |

> En production, `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL` doivent pointer vers la même URL publique. En dev local, seules les 3 premières variables sont nécessaires.

### 3. Générer et appliquer les migrations

```bash
# Générer le schema Better Auth (tables user, session, account, verification, rateLimit)
npx @better-auth/cli generate

# Générer et appliquer les migrations Drizzle
pnpm db:generate
pnpm db:migrate
```

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
│   │   ├── button.tsx
│   │   └── input.tsx
│   └── layout/                 # Composants de shell (Navbar, Sidebar…) — vide, ajouter ici
├── features/                   # Un répertoire par domaine fonctionnel
│   └── auth/                   # Implémentation de référence — dupliquer pour chaque feature
│       ├── actions.ts          # Server Actions — point d'entrée depuis l'UI
│       ├── service.ts          # Logique métier — orchestre les repositories
│       ├── repository.ts       # Requêtes DB + cache tags
│       ├── schema.ts           # Tables Drizzle de cette feature
│       ├── types.ts            # Types TypeScript scoped
│       └── components/         # Composants React spécifiques à la feature
├── hooks/                      # React hooks réutilisables (client uniquement) — vide, ajouter ici
├── lib/
│   ├── auth/
│   │   ├── index.ts            # Config Better Auth serveur (server-only)
│   │   ├── client.ts           # Client Better Auth navigateur
│   │   └── server.ts           # requireSession() / getOptionalSession()
│   ├── db/
│   │   ├── index.ts            # Instance Drizzle singleton (NeonDatabase<typeof schema>)
│   │   ├── auth-schema.ts      # Tables Better Auth (généré — ne pas éditer)
│   │   ├── schema.ts           # Re-exports centraux (ajouter: export * from "@/features/X/schema")
│   │   └── migrations/         # Généré par drizzle-kit (lancer db:generate puis db:migrate)
│   ├── env.ts                  # Variables d'env validées (@t3-oss/env-nextjs + Zod)
│   ├── logger.ts               # Logger Pino (server-only)
│   ├── validations/
│   │   └── common.ts           # Schémas Zod partagés (email, password, displayName)
│   └── utils.ts                # Fonctions utilitaires pures (cn())
├── proxy.ts                    # Protection des routes (cookies Better Auth) — Next 16
└── types/
    └── result.ts               # ActionResult<T> — type de retour générique des Server Actions
scripts/
└── seed.ts                     # Seeding de la base (no-op par défaut — à personnaliser)
```

## Flux de données

```
page.tsx → actions.ts → service.ts → repository.ts → lib/db
```

Chaque couche a une responsabilité unique. La feature `features/auth/` est l'implémentation de référence complète.

## Scripts

| Commande             | Description                             |
| -------------------- | --------------------------------------- |
| `pnpm dev`           | Serveur de développement                |
| `pnpm build`         | Build production                        |
| `pnpm typecheck`     | Vérification TypeScript (sans émission) |
| `pnpm lint`          | ESLint                                  |
| `pnpm lint:fix`      | ESLint avec auto-fix                    |
| `pnpm format`        | Prettier                                |
| `pnpm format:check`  | Vérification Prettier (CI)              |
| `pnpm test`          | Tests Vitest                            |
| `pnpm test:watch`    | Tests Vitest en mode watch              |
| `pnpm test:coverage` | Tests avec rapport de couverture        |
| `pnpm db:generate`   | Générer les migrations Drizzle          |
| `pnpm db:migrate`    | Appliquer les migrations                |
| `pnpm db:push`       | Push direct du schéma (dev uniquement)  |
| `pnpm db:check`      | Vérifier la cohérence du schéma         |
| `pnpm db:studio`     | Interface Drizzle Studio                |
| `pnpm db:seed`       | Seeder la base de données               |

## Règles clés

- **Jamais de `process.env.X` direct** — importer depuis `lib/env.ts` (exceptions documentées dans `CLAUDE.md`)
- **Jamais de saut de couche** — `page.tsx` ne peut pas appeler un repository directement
- **`requireSession()`** dans toutes les pages/actions protégées (ne pas se fier au proxy seul)
- **Zod avant `requireSession()`** dans les Server Actions — valider l'input d'abord, authentifier ensuite
- **`userTag(id)`** depuis `repository.ts` pour nommer les cache tags — cohérence lecture/écriture
- **`'use cache'` + `cacheTag`** sur les fonctions read des repositories (Next 16)
- **`server-only`** dans `lib/auth/index.ts`, `lib/db/index.ts`, `lib/logger.ts`, `repository.ts`, `service.ts`
- **Nouvelle feature** — créer `features/<nom>/` en s'inspirant de `features/auth/`, puis ajouter `export * from "@/features/<nom>/schema"` dans `lib/db/schema.ts`

Voir `CLAUDE.md` pour les règles et conventions complètes.

## Checklist mise en production

À effectuer avant tout déploiement réel (marqueurs `TODO(init-project)` dans le code) :

- [ ] **Auth** — `requireEmailVerification: true` dans `src/lib/auth/index.ts` (configurer un provider SMTP : Resend, Nodemailer…)
- [ ] **Auth** — vérifier que la table `rateLimit` est bien dans le schema généré (`npx @better-auth/cli generate`)
- [ ] **CSP** — remplacer `'unsafe-inline'` par des nonces dynamiques dans `proxy.ts` + `next.config.ts`
- [ ] **CSP** — élargir `connect-src 'self'` avec les domaines réels (Neon, analytics, CDN) dans `next.config.ts`
- [ ] **Routes** — synchroniser `protectedRoutes` et `config.matcher` dans `proxy.ts` pour chaque nouvelle route protégée
- [ ] **Env** — définir `NEXT_PUBLIC_APP_URL` avec l'URL de production (métadonnées OG)
- [ ] **Images** — renseigner `remotePatterns` dans `next.config.ts` si des images externes sont affichées
- [ ] **Cache** — ajuster `cacheLife` dans les `repository.ts` selon la fréquence de mutation des données

## License

MIT
