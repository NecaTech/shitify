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

### 2. Initialiser le projet

```bash
pnpm init-project
```

Configure le nom du projet, l'URL publique, le dépôt distant optionnel, crée `.env.local`, génère `BETTER_AUTH_SECRET`, et adapte les métadonnées du boilerplate.

### 3. Configurer l'environnement

Vérifier les variables dans `.env.local` :

| Variable              | Obligatoire    | Description                                               |
| --------------------- | -------------- | --------------------------------------------------------- |
| `DATABASE_URL`        | Oui            | URL PostgreSQL Neon (pooled, `postgresql://...`)          |
| `BETTER_AUTH_SECRET`  | Oui            | Secret aléatoire ≥ 32 car. (`openssl rand -base64 32`)    |
| `BETTER_AUTH_URL`     | Non sur Vercel | URL publique de l'app — fallback sur l'URL système Vercel |
| `NEXT_PUBLIC_APP_URL` | Non            | Même URL (métadonnées OG). Fallback Vercel puis localhost |

> `pnpm init-project` remplit `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL`. Sur Vercel, `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL` peuvent aussi être déduites de `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` si les variables système Vercel sont exposées. Il reste toujours `DATABASE_URL` à renseigner si elle n'a pas été fournie pendant l'initialisation.

### 4. Appliquer les migrations

```bash
pnpm db:migrate
```

Le boilerplate contient déjà une migration initiale couvrant Better Auth, les schémas génériques, et le CRUD configurable. Générer une nouvelle migration uniquement après modification d'un `schema.ts`.

### 5. Démarrer le serveur de développement

```bash
pnpm dev
```

La page d'accueil affiche le guide de démarrage tant que `src/app/page.tsx` n'a pas été remplacée par votre landing page.

### Déploiement Vercel reproductible

Après `pnpm init-project` et la création de la base Neon :

```bash
pnpm vercel:bootstrap
```

Le script vérifie le CLI Vercel, lie le dossier au projet Vercel, pousse `DATABASE_URL` et `BETTER_AUTH_SECRET` dans Vercel, configure aussi `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` si une URL publique est connue, puis lance un déploiement production.

Par défaut, la même `DATABASE_URL` est configurée dans les environnements Vercel `production`, `preview` et `development`. Le dev local, les previews et la prod travaillent donc sur la même base tant que `.env.local` contient cette même URL.

Cette stratégie est volontaire en mode `pilot` / `staging` pour accélérer les démos, diagnostics et itérations client. En mode `production`, la DB prod reste accessible pour maintenance, support, migration et diagnostic, mais elle ne doit pas devenir l'environnement de développement quotidien. Avant une vraie production client, séparer les environnements DB ou documenter explicitement l'exception d'exploitation.

Modes utiles :

```bash
pnpm vercel:bootstrap -- --project mon-projet --yes
pnpm vercel:bootstrap -- --project mon-projet --team mon-equipe --yes
pnpm vercel:bootstrap -- --no-deploy
pnpm vercel:bootstrap -- --production-only
pnpm vercel:pull-env
```

`pnpm vercel:pull-env` régénère `.env.local` depuis l'environnement Vercel `production`. Utiliser cette commande sur une nouvelle machine ou après modification des variables Vercel pour garantir que le dev local pointe vers la même DB que la prod.

Si aucune URL publique n'est fournie, le build utilise les variables système Vercel (`VERCEL_PROJECT_PRODUCTION_URL`, puis `VERCEL_URL`). Elles doivent être exposées dans les settings Vercel du projet.

---

## Structure du projet

```
src/
├── app/                              # Routing uniquement — pas de logique métier
│   ├── (authenticated)/              # Route group — toutes les routes protégées
│   │   ├── layout.tsx                # Appelle requireSession() une seule fois pour le groupe
│   │   └── dashboard/
│   │       └── page.tsx              # Page dashboard (à remplacer par le contenu projet)
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts          # Handler Better Auth — ne pas modifier
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── layout.tsx                    # Layout racine (fonts, metadata, viewport)
│   ├── page.tsx                      # Guide post-clonage (à remplacer par la landing page)
│   ├── error.tsx                     # Boundary d'erreur global ("use client")
│   ├── loading.tsx                   # Fallback de chargement racine (spinner global)
│   └── not-found.tsx                 # 404 global
├── components/
│   ├── ui/                           # Primitives shadcn/ui — domain-agnostic
│   │   ├── button.tsx
│   │   └── input.tsx
│   └── layout/                       # Composants de shell (Navbar, Sidebar…) — vide, à peupler
├── features/                         # Un répertoire par domaine fonctionnel
│   └── auth/                         # Implémentation de référence — copier pour chaque feature
│       ├── actions.ts                # Server Actions mutations/formulaires — "use server", Zod, session
│       ├── service.ts                # Orchestration métier pure — "server-only"
│       ├── repository.ts             # Requêtes Drizzle + 'use cache' + cacheTag — "server-only"
│       ├── schema.ts                 # Tables Drizzle de la feature
│       ├── types.ts                  # Types partagés (User, DTOs)
│       └── components/               # Composants React spécifiques à la feature
│           ├── LoginForm.tsx
│           ├── RegisterForm.tsx
│           └── ProfileForm.tsx
│   ├── booking/schema.ts             # Réservations / rendez-vous
│   ├── commerce/schema.ts            # Produits, commandes, lignes de commande
│   ├── contact/schema.ts             # Formulaires de contact / leads
│   ├── dashboard/                    # Dashboard configurable par projet pilote
│   │   ├── config.ts                 # Stats, actions, sections modifiables à la volée
│   │   └── components/
│   │       └── DashboardHome.tsx
│   ├── notifications/schema.ts       # Notifications utilisateur
│   ├── uploads/schema.ts             # Fichiers uploadés
│   └── workspace/schema.ts           # Espaces, membres, rôles
├── hooks/                            # React hooks réutilisables (client uniquement) — vide
├── lib/
│   ├── auth/
│   │   ├── index.ts                  # Config Better Auth (adapter Drizzle, trustedOrigins, rateLimit) — server-only
│   │   ├── client.ts                 # Client Better Auth navigateur (useSession, signIn…)
│   │   └── server.ts                 # requireSession() / getOptionalSession() — server-only
│   ├── db/
│   │   ├── index.ts                  # Instance Drizzle singleton + pool Neon — server-only
│   │   ├── auth-schema.ts            # Tables Better Auth autogénérées — ne jamais éditer manuellement
│   │   ├── schema.ts                 # Point d'entrée schema agrégé (re-exports des features)
│   │   └── migrations/               # Migration initiale + migrations générées
│   ├── env.ts                        # Variables d'env validées (@t3-oss/env-nextjs + Zod)
│   ├── logger.ts                     # Logger Pino — server-only
│   ├── utils.ts                      # cn() — clsx + tailwind-merge
│   └── validations/
│       └── common.ts                 # Schémas Zod partagés (emailSchema, passwordSchema, displayNameSchema)
├── proxy.ts                          # Protection des routes — export function proxy() (Next 16)
├── styles/
│   ├── globals.css                   # Imports Tailwind + fichiers theme
│   └── theme/
│       ├── colors.css                # Variables oklch brutes (:root + .dark)
│       ├── tokens.css                # Mapping @theme inline → classes Tailwind
│       ├── typography.css            # Pointeurs de polices
│       └── animations.css            # @keyframes
└── types/
    └── result.ts                     # ActionResult<T> — type de retour des Server Actions
scripts/
├── init-project.ts                   # Initialisation post-clonage
├── readiness.ts                      # Vérifications pré-démo/livraison
├── seed.ts                           # Seeding de la base — à personnaliser par projet
└── vercel-bootstrap.ts               # Liaison Vercel, env vars, déploiement prod
```

## Flux de données

```
Mutations client → actions.ts → service.ts → repository.ts → lib/db
Lectures page.tsx serveur → service.ts → repository.ts → lib/db
```

Chaque couche a une responsabilité unique. Les Server Components `page.tsx` peuvent appeler un service pour composer des données de lecture, mais ne doivent jamais appeler un repository ni `lib/db` directement. Les mutations et soumissions de formulaires passent par `actions.ts`. La feature `features/auth/` est l'implémentation de référence complète.

## Schémas génériques

Le boilerplate inclut des schémas Drizzle réutilisables pour accélérer les projets pilotes :

- `workspace` — organisations, espaces de travail, rôles et membres
- `uploads` — fichiers stockés, visibilité, métadonnées
- `notifications` — notifications utilisateur lues/non lues
- `contact` — demandes entrantes, leads, messages
- `booking` — réservations, rendez-vous, statuts
- `commerce` — produits, commandes, lignes de commande
- `crud` — ressources, champs et enregistrements configurables après déploiement

Tous les schémas sont exportés depuis `src/lib/db/schema.ts`. Après adaptation à un projet réel :

```bash
pnpm db:generate
pnpm db:migrate
```

## Dashboard configurable

La page `/dashboard` utilise `src/features/dashboard/config.ts`.

Modifier ce fichier permet d'adapter rapidement :

- les métriques affichées
- les actions principales
- les sections de suivi
- le texte de présentation du pilote

La page route reste volontairement fine : elle récupère la session, le profil, puis rend `DashboardHome`.

## CRUD configurable après déploiement

La route `/dashboard/crud` permet de créer des ressources métier sans nouvelle migration SQL :

- créer/supprimer une ressource (`clients`, `biens`, `demandes`, `prestations`...)
- ajouter/supprimer des champs
- créer/modifier/supprimer des enregistrements
- stocker les valeurs dans `resource_record.data` (`jsonb`)

Ce CRUD est conçu pour les projets pilotes, les démos ambassadeurs et le prototypage post-déploiement. Il ne doit pas devenir le modèle durable d'un domaine stable. Quand un modèle métier se stabilise, créer une vraie feature dédiée dans `src/features/<nom>/` avec `schema.ts`, `repository.ts`, `service.ts`, `actions.ts` et `types.ts`. Ne jamais stocker de secret ou donnée sensible dans `resource_record.data`.

## Scripts

| Commande                | Description                             |
| ----------------------- | --------------------------------------- |
| `pnpm dev`              | Serveur de développement                |
| `pnpm build`            | Build production                        |
| `pnpm typecheck`        | Vérification TypeScript (sans émission) |
| `pnpm lint`             | ESLint                                  |
| `pnpm lint:fix`         | ESLint avec auto-fix                    |
| `pnpm format`           | Prettier                                |
| `pnpm format:check`     | Vérification Prettier (CI)              |
| `pnpm init-project`     | Initialiser un projet après clonage     |
| `pnpm test`             | Tests Vitest                            |
| `pnpm test:watch`       | Tests Vitest en mode watch              |
| `pnpm test:coverage`    | Tests avec rapport de couverture        |
| `pnpm readiness`        | Vérification avant démo/livraison       |
| `pnpm readiness:static` | Vérification rapide sans lint/tests     |
| `pnpm vercel:bootstrap` | Configurer Vercel et déployer en prod   |
| `pnpm vercel:pull-env`  | Synchroniser `.env.local` depuis Vercel |
| `pnpm db:generate`      | Générer les migrations Drizzle          |
| `pnpm db:migrate`       | Appliquer les migrations                |
| `pnpm db:push`          | Push direct du schéma (dev uniquement)  |
| `pnpm db:check`         | Vérifier la cohérence du schéma         |
| `pnpm db:studio`        | Interface Drizzle Studio                |
| `pnpm db:seed`          | Seeder la base de données               |

## Readiness et garde-fous statiques

`pnpm readiness` lance typecheck, lint, format check, tests et vérifications statiques d'architecture. `pnpm readiness:static` lance uniquement la partie statique rapide.

Les garde-fous vérifient notamment :

- pas d'import runtime `@/lib/db` hors repositories et adapter Better Auth ;
- pas d'import `repository.ts` depuis pages, actions, services non autorisés ou composants ;
- pas de dépendance feature dans `components/ui` ;
- pas de `process.env` hors exceptions documentées ;
- `server-only` présent dans les `service.ts` et `repository.ts` ;
- pas de `db:push` dans les scripts de maintenance ;
- pas de test connecté à une DB prod/Neon réelle.

## Règles clés

- **Jamais de `process.env.X` direct** — importer depuis `lib/env.ts` (exceptions documentées dans `AGENT.md`)
- **Jamais de saut de couche** — `page.tsx` peut appeler un service pour lire, mais jamais un repository ou `lib/db`
- **Jamais de hardcoding de contournement** — pas d'URL, secret, id, rôle, email, valeur DB ou résultat de test codé en dur pour faire passer un build/test/déploiement
- **Diagnostic avant correction** — reproduire/localiser l'erreur, identifier la couche responsable, puis corriger à cette couche
- **`requireSession()`** dans toutes les pages/actions protégées (ne pas se fier au proxy seul)
- **Zod avant `requireSession()`** dans les Server Actions — valider l'input d'abord, authentifier ensuite
- **Cache tags** depuis `cache.ts` de feature — cohérence lecture/écriture sans importer `repository.ts` depuis `actions.ts`
- **`'use cache'` + `cacheTag`** sur les fonctions read des repositories (Next 16)
- **`server-only`** dans `lib/auth/index.ts`, `lib/db/index.ts`, `lib/logger.ts`, `repository.ts`, `service.ts`
- **Nouvelle feature** — créer `features/<nom>/` en s'inspirant de `features/auth/`, puis ajouter `export * from "@/features/<nom>/schema"` dans `lib/db/schema.ts`

Voir `AGENT.md` pour les règles et conventions complètes.

## Checklist mise en production

À effectuer avant tout déploiement réel (marqueurs `TODO(init-project)` dans le code) :

- [ ] **Auth** — `requireEmailVerification: true` dans `src/lib/auth/index.ts` (configurer un provider SMTP : Resend, Nodemailer…)
- [ ] **Auth** — vérifier que la table `rateLimit` reste exportée si la configuration Better Auth change
- [ ] **CSP** — remplacer `'unsafe-inline'` par des nonces dynamiques dans `proxy.ts` + `next.config.ts`
- [ ] **CSP** — élargir `connect-src 'self'` avec les domaines réels (Neon, analytics, CDN) dans `next.config.ts`
- [ ] **Routes** — synchroniser `protectedRoutes` et `config.matcher` dans `proxy.ts` pour chaque nouvelle route protégée
- [ ] **Env** — avec domaine custom, définir `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL` avec l'URL canonique ; sans domaine custom, vérifier que les variables système Vercel sont exposées
- [ ] **Images** — renseigner `remotePatterns` dans `next.config.ts` si des images externes sont affichées
- [ ] **Cache** — ajuster `cacheLife` dans les `repository.ts` selon la fréquence de mutation des données

## License

MIT
