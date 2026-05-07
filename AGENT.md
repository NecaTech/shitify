# AGENT.md - NecaTech Boilerplate

Ce fichier est le routeur d'orientation du boilerplate. Il indique quels fichiers
`AGENT.md` lire avant d'intervenir, afin de limiter la remise en contexte et de
garder les modifications dans la bonne couche.

## Protocole de démarrage

1. Identifier les fichiers ou dossiers concernés par la demande.
2. Lire ce fichier racine.
3. Lire tous les `AGENT.md` applicables du plus général au plus proche du fichier
   modifié.
4. En cas de doute entre deux règles, appliquer la règle la plus proche du fichier
   modifié.
5. Si la demande traverse plusieurs domaines, lire chaque `AGENT.md` local concerné
   avant de modifier.

Exemple : modifier `src/features/crud/actions.ts` implique de lire :

- `AGENT.md`
- `src/features/AGENT.md`
- `src/features/crud/AGENT.md`

## Détection Boilerplate

Si `git remote get-url origin` contient `necatech-boilerplate` ou que `git remote`
est vide, et que la demande ne concerne pas le boilerplate lui-même :

> Ce projet est encore configuré en tant que boilerplate. Lance `pnpm init-project`
> pour l'initialiser.

Exception : si la demande concerne explicitement le boilerplate, ses scripts, ses
règles, son template GitHub ou son déploiement reproductible, travailler sur le
boilerplate sans demander d'initialisation.

## Autorité des règles

- Le fichier `AGENT.md` le plus proche du fichier modifié prévaut.
- Une règle locale peut restreindre ou préciser cette règle racine.
- Les scripts Node purs (`scripts/`, `drizzle.config.ts`) sont hors runtime Next.js :
  leurs exceptions sont documentées dans `scripts/AGENT.md`.
- Ne pas appliquer une règle de feature (`src/features/AGENT.md`) aux primitives
  partagées (`src/components`, `src/lib`) si un fichier local plus proche existe.
- Si une règle est incomplète ou contradictoire, corriger le fichier `AGENT.md`
  concerné dans le même changement que la correction technique.

## Modes projet

Ces modes sont documentaires pour l'instant. Ne pas ajouter de blocage runtime sans
demande explicite.

- `pilot` : itération rapide, DB partagée local/preview/prod autorisée si assumée.
- `staging` : validation client, DB partagée autorisée si l'équipe l'accepte explicitement.
- `production` : accès prod autorisé pour maintenance, diagnostic, migration et support,
  mais pas comme environnement de développement quotidien.

TODO(init-project): avant une vraie production client, séparer les environnements DB
ou documenter formellement l'exception d'exploitation.

## Routage par zone

| Zone                                        | Lire                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Racine, package, README, config projet      | `AGENT.md`                                                                                             |
| Documentation                               | `docs/AGENT.md`                                                                                        |
| Assets statiques publics                    | `public/AGENT.md`                                                                                      |
| Scripts Node, init, readiness, seed, Vercel | `scripts/AGENT.md`                                                                                     |
| Routes App Router                           | `src/app/AGENT.md`                                                                                     |
| Routes protégées                            | `src/app/AGENT.md`, `src/app/(authenticated)/AGENT.md`                                                 |
| Dashboard routes                            | `src/app/AGENT.md`, `src/app/(authenticated)/AGENT.md`, `src/app/(authenticated)/dashboard/AGENT.md`   |
| API route handlers                          | `src/app/AGENT.md`, `src/app/api/AGENT.md`                                                             |
| Login                                       | `src/app/AGENT.md`, `src/app/login/AGENT.md`, `src/features/auth/AGENT.md`, `src/lib/auth/AGENT.md`    |
| Register                                    | `src/app/AGENT.md`, `src/app/register/AGENT.md`, `src/features/auth/AGENT.md`, `src/lib/auth/AGENT.md` |
| Composants partagés                         | `src/components/AGENT.md`                                                                              |
| Primitives UI                               | `src/components/AGENT.md`, `src/components/ui/AGENT.md`, `src/styles/AGENT.md`                         |
| Layout components                           | `src/components/AGENT.md`, `src/components/layout/AGENT.md`                                            |
| Features métier                             | `src/features/AGENT.md`, puis `src/features/<feature>/AGENT.md` si présent                             |
| Auth feature                                | `src/features/AGENT.md`, `src/features/auth/AGENT.md`, `src/lib/auth/AGENT.md`                         |
| CRUD configurable                           | `src/features/AGENT.md`, `src/features/crud/AGENT.md`                                                  |
| Dashboard feature                           | `src/features/AGENT.md`, `src/features/dashboard/AGENT.md`                                             |
| Booking                                     | `src/features/AGENT.md`, `src/features/booking/AGENT.md`                                               |
| Commerce                                    | `src/features/AGENT.md`, `src/features/commerce/AGENT.md`                                              |
| Contact                                     | `src/features/AGENT.md`, `src/features/contact/AGENT.md`                                               |
| Notifications                               | `src/features/AGENT.md`, `src/features/notifications/AGENT.md`                                         |
| Uploads                                     | `src/features/AGENT.md`, `src/features/uploads/AGENT.md`                                               |
| Workspace, rôles, permissions               | `src/features/AGENT.md`, `src/features/workspace/AGENT.md`, `src/lib/auth/AGENT.md`                    |
| Core infra                                  | `src/lib/AGENT.md`                                                                                     |
| Auth infra Better Auth                      | `src/lib/AGENT.md`, `src/lib/auth/AGENT.md`                                                            |
| DB, Drizzle, migrations                     | `src/lib/AGENT.md`, `src/lib/db/AGENT.md`                                                              |
| Validations Zod partagées                   | `src/lib/AGENT.md`, `src/lib/validations/AGENT.md`                                                     |
| Styles, Tailwind, tokens                    | `src/styles/AGENT.md`                                                                                  |
| Hooks React                                 | `src/hooks/AGENT.md`                                                                                   |
| Types transverses                           | `src/types/AGENT.md`                                                                                   |
| Tests                                       | `tests/AGENT.md`                                                                                       |
| Tests de features                           | `tests/AGENT.md`, `tests/features/AGENT.md`                                                            |
| Tests auth                                  | `tests/AGENT.md`, `tests/features/AGENT.md`, `tests/features/auth/AGENT.md`                            |

## Routage par type de tâche

- Initialiser un projet cloné : `scripts/AGENT.md`, `README.md`, `scripts/init-project.ts`.
- Déployer ou synchroniser Vercel : `scripts/AGENT.md`, `scripts/vercel-bootstrap.ts`, `.env.example`, `src/lib/env.ts`.
- Ajouter une route protégée : `src/app/AGENT.md`, `src/app/(authenticated)/AGENT.md`, `src/proxy.ts`.
- Ajouter une feature typée : `src/features/AGENT.md`, `src/lib/db/AGENT.md`, puis créer `src/features/<feature>/AGENT.md` si la feature a un contrat propre.
- Modifier un schéma : `src/features/AGENT.md`, `src/features/<feature>/AGENT.md`, `src/lib/db/AGENT.md`.
- Modifier l'auth : `src/lib/auth/AGENT.md`, `src/features/auth/AGENT.md`, `src/proxy.ts`.
- Modifier l'UI : `src/components/AGENT.md`, `src/styles/AGENT.md`, puis le sous-dossier local.
- Corriger un bug : lire les agents de la couche suspecte avant patch.
- Ajouter ou corriger des tests : `tests/AGENT.md`, puis le sous-dossier local.

## Règles d'architecture globales

- Routes App Router : composition et routing uniquement.
- Server Components `page.tsx` : peuvent appeler un `service.ts` pour lire des données.
- Mutations et formulaires : passent par `actions.ts`.
- Services : portent l'orchestration métier et ne connaissent pas Drizzle.
- Repositories : seuls points d'accès DB applicatifs, Drizzle uniquement.
- `src/lib/db` : infrastructure DB, pas de logique métier.
- Composants partagés : pas de dépendance à une feature.
- Primitives UI : aucune logique métier ni cas client spécifique.
- Scripts : programmes Node purs, exceptions documentées dans `scripts/AGENT.md`.
- `process.env.X` : interdit hors exceptions documentées (`src/lib/env.ts`, infra serveur
  ciblée, scripts Node purs, `drizzle.config.ts`).
- `server-only` : obligatoire dans les `service.ts`, `repository.ts` et modules infra serveur.
- Migrations : générées avec Drizzle Kit ; pas de migration SQL manuelle.
- `db:push` : dev local uniquement, jamais staging/prod/DB partagée.
- Tests : isolés de la prod et de la DB partagée.
- Auth protégée : `requireSession()` obligatoire côté serveur ; le proxy ne suffit jamais.
- Proxy/auth : conserver le contrat anti-boucle `redirect` + `x-current-path`.

Flux autorisés :

```text
Mutations client -> actions.ts -> service.ts -> repository.ts -> lib/db
Lectures page.tsx serveur -> service.ts -> repository.ts -> lib/db
Scripts CLI -> env explicite -> client DB/script dédié
```

Flux interdits :

```text
page.tsx -> repository.ts
actions.ts -> db
component React -> service.ts serveur
component React -> repository.ts
src/components/ui -> src/features/*
src/lib/db -> src/features/*
```

## Anti-contournement

- Ne jamais contourner une règle par hardcoding pour faire passer un build, un test,
  une démo ou un déploiement.
- Interdit : URL, secret, id utilisateur, email admin, rôle, flag de permission,
  valeur DB, résultat d'API ou valeur de test codée en dur dans le code applicatif.
- Les valeurs variables passent par `.env.local`, Vercel env, une config projet
  explicite, un schéma DB, ou une factory de test.
- Si une règle bloque une correction, corriger la cause ou mettre à jour la règle
  documentée. Ne pas ajouter d'exception implicite dans le code.
- Toute exception temporaire doit être nommée avec `TODO(init-project)` ou
  `TODO(<ticket>)`, documenter la raison, et rester hors secrets/données client.

## Diagnostic avant correction

- Ne pas patcher un symptôme sans avoir identifié la source du problème.
- Avant toute correction non triviale : reproduire ou localiser l'erreur, identifier
  la couche responsable, puis corriger à cette couche.
- Respecter l'architecture existante même sous pression : pas de saut de couche, pas
  de duplication de logique, pas de constante magique pour masquer un bug.
- Une correction acceptable doit expliquer pourquoi le problème arrivait et pourquoi
  le changement le résout durablement.
- Si la cause est une règle incomplète ou contradictoire, mettre à jour l'`AGENT.md`
  concerné dans le même changement.

## Vérification minimale

Adapter les checks au changement, mais avant push d'un changement boilerplate viser :

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm readiness
pnpm readiness:release
pnpm build
```

Pour une modification documentaire seule, `pnpm readiness:static` peut suffire si
aucun code n'a été touché.
