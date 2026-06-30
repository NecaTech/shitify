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

## Cycle de développement après clonage

Le boilerplate suit trois phases explicites pour un projet client cloné depuis ce
socle. Le contrat détaillé vit dans
[docs/development-phases.md](docs/development-phases.md).

| Phase        | Moment                                     | Auth dashboard               | DB requise      |
| ------------ | ------------------------------------------ | ---------------------------- | --------------- |
| `dev`        | Développement initial après clonage        | Session locale signée        | Non             |
| `staging`    | DB client créée et URL configurée          | Better Auth + Drizzle + Neon | Oui             |
| `production` | Projet jugé livrable et prêt à être exposé | Better Auth + Drizzle + Neon | Oui, production |

### Phase 1 - Dev local sans DB client

Objectif : commencer à développer immédiatement après clonage, avant la création
de l'URL DB client.

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Initialiser le projet

```bash
pnpm init-project
```

Configure le nom du projet, l'URL publique, le dépôt distant optionnel, crée `.env.local`, génère `BETTER_AUTH_SECRET`, et adapte les métadonnées du boilerplate.

### 3. Configurer l'environnement dev

Vérifier les variables dans `.env.local` :

| Variable                   | Obligatoire    | Description                                               |
| -------------------------- | -------------- | --------------------------------------------------------- |
| `DATABASE_URL`             | Non en dev     | URL PostgreSQL Neon, requise à partir du staging          |
| `APP_ENV`                  | Oui            | Environnement applicatif : `dev`, `staging` ou `prod`     |
| `CLIENT_SLUG`              | Oui            | Slug client pour le schema DB PostgreSQL                  |
| `PROJECT_SLUG`             | Oui            | Slug projet pour le schema DB PostgreSQL                  |
| `BETTER_AUTH_SECRET`       | Oui            | Secret aléatoire ≥ 32 car. (`openssl rand -base64 32`)    |
| `BETTER_AUTH_URL`          | Non sur Vercel | URL publique de l'app — fallback sur l'URL système Vercel |
| `FOUNDER_EMAIL`            | Seed founder   | Email du compte founder initial                           |
| `FOUNDER_NAME`             | Seed founder   | Nom affiché du compte founder                             |
| `FOUNDER_INITIAL_PASSWORD` | Seed founder   | Mot de passe initial, jamais affiché par le seed          |
| `LOCAL_AUTH_ENABLED`       | Dev local      | `true` pour ouvrir le dashboard sans DB client            |
| `FOUNDER_RESET_PASSWORD`   | Non            | Mettre à `true` pour remplacer le mot de passe existant   |
| `INITIAL_WORKSPACE_NAME`   | Non            | Nom du workspace initial, sinon dérivé de `PROJECT_SLUG`  |
| `INITIAL_WORKSPACE_SLUG`   | Non            | Slug du workspace initial, sinon dérivé de `PROJECT_SLUG` |
| `NEXT_PUBLIC_APP_URL`      | Non            | Même URL (métadonnées OG). Fallback Vercel puis localhost |

> `pnpm init-project` remplit `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL`. Sur Vercel, `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL` peuvent aussi être déduites de `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` si les variables système Vercel sont exposées. `APP_ENV`, `CLIENT_SLUG` et `PROJECT_SLUG` déterminent le schema PostgreSQL applicatif `{CLIENT_SLUG}_{PROJECT_SLUG}_{APP_ENV}`.

En phase `dev`, `LOCAL_AUTH_ENABLED=true` permet de se connecter au dashboard
sans DB client avec `FOUNDER_EMAIL`, `FOUNDER_NAME` et
`FOUNDER_INITIAL_PASSWORD`. Cette session est signée avec
`BETTER_AUTH_SECRET`, reste limitée au développement local, et ne remplace pas
Better Auth pour un projet client connecté à une vraie base.

Le founder garde une seule session et peut basculer dans le dashboard entre la
vue `Founder` et la vue `Admin`. La vue Founder pilote les invariants du
boilerplate et la progression post-clonage. La vue Admin simule l'expérience du
plus haut niveau workspace sans exiger un second compte local.

### 4. Ouvrir le dashboard local

```bash
pnpm dev
```

Puis ouvrir `/login` et se connecter avec les variables founder locales. Le
dashboard `/dashboard` devient le point de départ du développement privé sans
Neon, sans migration Drizzle et sans seed DB.

### Option - DB locale pour invariants pré-clonage

Le dashboard dev reste utilisable sans DB. Quand un invariant boilerplate doit
être vérifié avant clonage client avec de vraies écritures DB, utiliser la base
PostgreSQL locale dédiée :

```bash
pnpm db:local:env
pnpm db:local:up
pnpm db:push
pnpm db:seed
```

Ce flux configure `.env.local` avec
`postgres://necatech:***@localhost:54329/necatech_boilerplate`, lance Postgres
via Docker, synchronise le schéma avec `db:push` en `APP_ENV=dev`, puis
crée le founder et le workspace initial. Il sert aux invariants pré-clonage
comme la création de rôles workspace.

Pré-requis : l'utilisateur courant doit pouvoir accéder au socket Docker. Sur
Linux, cela implique généralement d'être membre du groupe `docker`, puis de
rouvrir la session shell.

Ne pas committer de migration Drizzle générée depuis ce flux. La règle du
boilerplate reste : `src/lib/db/migrations/` contient seulement `.gitkeep`.
Les migrations SQL sont générées après `pnpm init-project` dans chaque projet
client.

### Phase 2 - Staging avec DB client

Objectif : basculer vers le vrai chemin applicatif dès que la DB client existe.

Configurer :

```env
APP_ENV=staging
DATABASE_URL=postgresql://...
LOCAL_AUTH_ENABLED=false
```

Puis générer et appliquer la baseline DB du projet client :

```bash
pnpm db:generate
pnpm db:migrate
```

Le boilerplate ne commit pas de migration initiale concrète. Les migrations
Drizzle contiennent le nom réel du schema PostgreSQL ; chaque projet client doit
donc générer sa baseline après `pnpm init-project`, une fois `APP_ENV`,
`CLIENT_SLUG`, `PROJECT_SLUG` et `DATABASE_URL` configurés.

Seeder ensuite le founder et le workspace initial :

```bash
pnpm db:seed
```

Le seed officiel crée ou met à jour un seul compte `founder` et le workspace
initial. Il exige `FOUNDER_EMAIL`, `FOUNDER_NAME` et
`FOUNDER_INITIAL_PASSWORD`, ne journalise jamais le mot de passe ni son hash, et
ne crée pas le founder comme membre du workspace. Si le compte founder existe
déjà, son mot de passe est conservé ; pour le remplacer explicitement, lancer le
seed avec `FOUNDER_RESET_PASSWORD=true`.

À partir de cette phase, `/login` utilise Better Auth avec la DB. Ne pas garder
`LOCAL_AUTH_ENABLED=true` pour valider un projet client.

### Phase 3 - Production livrable

Objectif : exposer le projet une fois le niveau livrable atteint.

Configuration attendue :

```env
APP_ENV=prod
LOCAL_AUTH_ENABLED=false
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://...
NEXT_PUBLIC_APP_URL=https://...
```

Avant production, revoir les warnings readiness liés à l'email verification, la
CSP, les domaines externes et la séparation DB. La page d'accueil affiche le
guide de démarrage tant que `src/app/page.tsx` n'a pas été remplacée par votre
landing page.

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
│   │       ├── layout.tsx            # Shell dashboard natif
│   │       ├── page.tsx              # Pilote, accueil privé canonique
│   │       └── administration/
│   │           └── page.tsx          # Placeholder initial pour future administration
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
│   ├── dashboard/                    # Shell dashboard natif et navigation déclarative
│   │   ├── config.ts                 # Liens/groupes dashboard typés
│   │   └── components/
│   │       ├── DashboardShell.tsx
│   │       ├── DashboardNav.tsx
│   │       ├── DashboardHeader.tsx
│   │       ├── PiloteHome.tsx
│   │       └── AdministrationPlaceholder.tsx
│   ├── notifications/schema.ts       # Notifications utilisateur
│   ├── uploads/schema.ts             # Fichiers uploadés
│   └── workspace/schema.ts           # Espaces, membres, rôles
├── hooks/                            # React hooks réutilisables (client uniquement) — vide
├── lib/
│   ├── auth/
│   │   ├── index.ts                  # Config Better Auth (adapter Drizzle, trustedOrigins, rateLimit) — server-only
│   │   ├── client.ts                 # Client Better Auth navigateur (useSession, signIn…)
│   │   ├── local.ts                  # Auth locale signée pour phase dev sans DB client
│   │   ├── local-cookie.ts           # Nom du cookie local partagé avec le proxy
│   │   └── server.ts                 # requireSession() / getOptionalSession() — server-only
│   ├── db/
│   │   ├── index.ts                  # Instance Drizzle singleton + pool Neon — server-only
│   │   ├── app-schema.ts             # Namespace PostgreSQL Drizzle dérivé de l'environnement
│   │   ├── schema-name.ts            # Nom de schema DB: client_projet_env
│   │   ├── auth-schema.generated.ts  # Sortie brute Better Auth CLI — ne pas importer dans l'app
│   │   ├── auth-schema.ts            # Tables Better Auth transformées schema-aware — ne jamais éditer manuellement
│   │   ├── schema.ts                 # Point d'entrée schema agrégé (re-exports des features)
│   │   └── migrations/               # Baseline générée par projet après init-project
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
├── seed.ts                           # Seed founder officiel et workspace initial
└── vercel-bootstrap.ts               # Liaison Vercel, env vars, déploiement prod
```

## Flux de données

```
Mutations client → actions.ts → service.ts → repository.ts → lib/db
Lectures page.tsx serveur → service.ts → repository.ts → lib/db
```

Chaque couche a une responsabilité unique. Les Server Components `page.tsx` peuvent appeler un service pour composer des données de lecture, mais ne doivent jamais appeler un repository ni `lib/db` directement. Les mutations et soumissions de formulaires passent par `actions.ts`. La feature `features/auth/` est l'implémentation de référence complète.

## Schémas génériques

Le boilerplate inclut des schémas Drizzle réutilisables pour accélérer les projets clients :

- `workspace` — organisations, espaces de travail, rôles et membres
- `uploads` — fichiers stockés, visibilité, métadonnées
- `notifications` — notifications utilisateur lues/non lues
- `contact` — demandes entrantes, leads, messages
- `booking` — réservations, rendez-vous, statuts
- `commerce` — produits, commandes, lignes de commande

Tous les schémas sont exportés depuis `src/lib/db/schema.ts`. Après adaptation à un projet réel :

```bash
pnpm auth:generate
pnpm db:generate
pnpm db:migrate
```

`pnpm auth:generate` régénère les tables Better Auth en deux temps : sortie brute CLI dans `src/lib/db/auth-schema.generated.ts`, puis transformation contrôlée vers `src/lib/db/auth-schema.ts` avec `appSchema.table(...)`. Le fichier `auth-schema.ts` reste le seul point d'import applicatif ; ne jamais importer `auth-schema.generated.ts` dans l'application.

### Stratégie de baseline Drizzle

Le boilerplate retient l'Option A : migrations générées par projet après `init-project`.

Raison : Drizzle sérialise le nom concret du schema PostgreSQL dans les fichiers SQL et snapshots. Committer une baseline générique avec un schema arbitraire (`acme_portal_dev`, `necatech_boilerplate_dev`, etc.) créerait une dette et un risque de réutilisation accidentelle. La baseline doit être générée dans le projet client, avec les slugs réels.

Conséquence pratique :

- le boilerplate garde `src/lib/db/migrations/` vide hors `.gitkeep` ;
- `pnpm init-project` renseigne `APP_ENV=dev`, `CLIENT_SLUG` et `PROJECT_SLUG` ;
- `pnpm db:generate` crée la baseline locale du projet ;
- `pnpm db:migrate` l'applique ensuite à la DB ciblée après création du schema par le garde DB.

## Dashboard natif

`/dashboard` est le Pilote : l'accueil privé canonique après connexion. Il rend
un shell dashboard natif avec sidebar desktop, navigation mobile basse, header
compact, nom utilisateur, badge founder quand `session.user.role` vaut
`founder`, et action de déconnexion.

`/dashboard/administration` existe comme placeholder initial. Il prépare la zone
où vivront de futures fonctions d'administration, mais il ne crée pas encore de
membres, n'envoie pas d'invitations et n'intègre pas de provider email.

La navigation dashboard vit dans `src/features/dashboard/config.ts`. Les
sections futures s'ajoutent avec des routes dédiées et des features typées
(`schema.ts`, `repository.ts`, `service.ts`, `actions.ts`, `types.ts`), puis une
entrée de navigation déclarative. Le boilerplate ne fournit plus de CRUD
configurable comme comportement natif du dashboard.

## Rôles et seed founder

Le rôle global `founder` est une autorité plateforme stockée sur `user.role`.
Les rôles bootstrap du workspace restent limités à `owner` et `admin` dans
`workspace_membership.role`. Les rôles métier additionnels sont créés par
workspace dans la DB et portent leurs permissions explicites, notamment les vues
de navigation dashboard autorisées.

`pnpm db:seed` crée ou met à jour le founder et le workspace initial sans faire
du founder un membre du workspace. En dev avec DB locale configurée, le founder
peut créer des rôles workspace et basculer de perspective pour vérifier les vues
autorisées. Les futures invitations de membres devront passer par une feature
dédiée et un lien email de confiance ; ce flux n'est pas implémenté dans le
boilerplate actuel.

## Scripts

| Commande                 | Description                                  |
| ------------------------ | -------------------------------------------- |
| `pnpm dev`               | Serveur de développement                     |
| `pnpm build`             | Build production                             |
| `pnpm typecheck`         | Vérification TypeScript (sans émission)      |
| `pnpm lint`              | ESLint                                       |
| `pnpm lint:fix`          | ESLint avec auto-fix                         |
| `pnpm format`            | Prettier                                     |
| `pnpm format:check`      | Vérification Prettier (CI)                   |
| `pnpm init-project`      | Initialiser un projet après clonage          |
| `pnpm test`              | Tests Vitest                                 |
| `pnpm test:watch`        | Tests Vitest en mode watch                   |
| `pnpm test:coverage`     | Tests avec rapport de couverture             |
| `pnpm test:e2e`          | Tests Playwright E2E smoke                   |
| `pnpm readiness`         | Vérification avant démo/livraison            |
| `pnpm readiness:static`  | Vérification rapide sans lint/tests          |
| `pnpm readiness:release` | Readiness complet + E2E avant livraison      |
| `pnpm vercel:bootstrap`  | Configurer Vercel et déployer en prod        |
| `pnpm vercel:pull-env`   | Synchroniser `.env.local` depuis Vercel      |
| `pnpm auth:generate`     | Régénérer le schema Better Auth schema-aware |
| `pnpm db:generate`       | Générer les migrations Drizzle               |
| `pnpm db:migrate`        | Appliquer les migrations                     |
| `pnpm db:push`           | Push direct du schéma (dev uniquement)       |
| `pnpm db:check`          | Vérifier la cohérence du schéma              |
| `pnpm db:studio`         | Interface Drizzle Studio                     |
| `pnpm db:seed`           | Seeder la base de données                    |

Les commandes DB passent par `scripts/assert-safe-db-env.ts` avant Drizzle ou le seed. Ce garde valide `APP_ENV`, `CLIENT_SLUG`, `PROJECT_SLUG`, `DATABASE_URL`, bloque `db:push` hors `dev`, bloque `db:seed` en `prod`, et crée le schema PostgreSQL applicatif avant `db:migrate` / `db:push` avec `CREATE SCHEMA IF NOT EXISTS "<schemaName>"`.

`pnpm vercel:pull-env` cible l'environnement Vercel production. Si `.env.local` existe, la commande refuse d'écraser le fichier sans confirmation explicite :

```bash
CONFIRM_PULL_ENV_PROD=overwrite-env-local pnpm vercel:pull-env
```

## Readiness et garde-fous statiques

`pnpm readiness` lance typecheck, lint, format check, tests et vérifications statiques d'architecture. `pnpm readiness:static` lance uniquement la partie statique rapide. `pnpm readiness:release` ajoute les tests Playwright E2E pour les contrôles pré-livraison ou staging, sans ralentir la boucle de dev quotidienne.

Les garde-fous vérifient notamment :

- pas d'import runtime `@/lib/db` hors repositories et adapter Better Auth ;
- pas d'import `repository.ts` depuis pages, actions, services non autorisés ou composants ;
- pas de dépendance feature dans `components/ui` ;
- pas de `process.env` hors exceptions documentées ;
- `server-only` présent dans les `service.ts` et `repository.ts` ;
- pas de `db:push` dans les scripts de maintenance ;
- pas de test connecté à une DB prod/Neon réelle.
- schema Better Auth actif généré via `appSchema.table(...)`, sans retour à `pgTable` ni référence `public` ;
- aucun import applicatif de `src/lib/db/auth-schema.generated.ts`.
- scripts DB et Vercel env protégés par `scripts/assert-safe-db-env.ts`.
- aucun `pgTable` / `pgEnum` applicatif hors sortie brute Better Auth ;
- aucune migration commitée ne doit créer un objet ou une FK dans `public`.

## E2E Playwright

Les tests E2E vivent dans `e2e/`. La suite initiale vérifie les chemins critiques qui ne nécessitent pas de seed de base de données : formulaire de connexion, formulaire d'inscription et redirection des routes protégées.

Avant le premier lancement local :

```bash
pnpm playwright install
```

Puis :

```bash
pnpm test:e2e
```

Pour tester une instance déjà démarrée, renseigner `E2E_BASE_URL` :

```bash
E2E_BASE_URL=https://staging.example.com pnpm test:e2e
```

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

## Roadmap et tickets

La roadmap d'évolution du boilerplate et ses tickets d'exécution vivent dans
[`docs/roadmap.md`](docs/roadmap.md).

## Checklist mise en production

À effectuer avant tout déploiement réel (marqueurs `TODO(init-project)` dans le code) :

- [ ] **Auth** — `requireEmailVerification: true` dans `src/lib/auth/index.ts` (configurer un provider SMTP : Resend, Nodemailer…)
- [ ] **Auth** — vérifier que la table `rateLimit` reste exportée si la configuration Better Auth change
- [ ] **Auth** — lancer `pnpm auth:generate` après tout changement Better Auth qui impacte les tables
- [ ] **CSP** — remplacer `'unsafe-inline'` par des nonces dynamiques dans `proxy.ts` + `next.config.ts`
- [ ] **CSP** — élargir `connect-src 'self'` avec les domaines réels (Neon, analytics, CDN) dans `next.config.ts`
- [ ] **Routes** — synchroniser `protectedRoutes` et `config.matcher` dans `proxy.ts` pour chaque nouvelle route protégée
- [ ] **Env** — avec domaine custom, définir `BETTER_AUTH_URL` et `NEXT_PUBLIC_APP_URL` avec l'URL canonique ; sans domaine custom, vérifier que les variables système Vercel sont exposées
- [ ] **Images** — renseigner `remotePatterns` dans `next.config.ts` si des images externes sont affichées
- [ ] **Cache** — ajuster `cacheLife` dans les `repository.ts` selon la fréquence de mutation des données

## License

MIT
