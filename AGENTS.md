# Shitify

## Start here

Shitify est un projet client issu du boilerplate NecaTech. Avant de modifier un
chemin, lire ce fichier et chaque `AGENTS.md` plus proche depuis la racine du
dépôt jusqu'à ce chemin. Le contrat le plus proche affine ses ancêtres ; il ne
remplace pas les invariants de l'ensemble du dépôt.

Le remote détermine le mode de travail :

- un remote contenant `necatech-boilerplate` signifie `boilerplate-source` ;
- tout autre remote projet signifie `client-project` (cas de Shitify) ;
- aucun remote signifie que le contexte projet est incomplet.

En mode `client-project`, le projet se développe avec `APP_ENV=dev` ; les phases
staging et production appartiennent à ce projet client.

## Projet

Shitify est un projet issu du boilerplate NecaTech.

Objectif: Application web construite avec le boilerplate NecaTech.

## Agent skills

### Issue tracker

Issues and PRDs live in GitHub Issues, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to the default labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `CONTEXT.md` plus `docs/adr/`. See `docs/agents/domain.md`.

## Routes

| Area                                           | Read next                                                       |
| ---------------------------------------------- | --------------------------------------------------------------- |
| Public assets                                  | `public/AGENTS.md`                                              |
| Scripts, initialization, readiness, DB tooling | `scripts/AGENTS.md`                                             |
| App Router and route handlers                  | `src/app/AGENTS.md`, then the nearest route contract            |
| Shared components and UI primitives            | `src/components/AGENTS.md`, then the nearest component contract |
| Features                                       | `src/features/AGENTS.md`, then the nearest feature contract     |
| Shared infrastructure                          | `src/lib/AGENTS.md`, then the nearest infrastructure contract   |
| Styles                                         | `src/styles/AGENTS.md`                                          |
| Hooks                                          | `src/hooks/AGENTS.md`                                           |
| Shared types                                   | `src/types/AGENTS.md`                                           |
| Tests                                          | `tests/AGENTS.md`, then the nearest test contract               |
| End-to-end tests                               | `e2e/AGENTS.md`                                                 |

## Global invariants

- App Router pages compose navigation and reads; durable business rules live in features.
- Mutations flow through `actions.ts -> service.ts -> repository.ts -> lib/db`.
- Server reads flow through `page.tsx -> service.ts -> repository.ts -> lib/db`.
- Repositories are the only application DB access points. Services do not know Drizzle.
- Shared components and `src/lib` do not depend on feature implementations.
- Server services, repositories, auth, DB, and logging modules preserve `server-only`.
- Environment values pass through validated configuration except documented local
  infrastructure and script exceptions.
- Drizzle Kit generates migrations. `db:push` is limited to local development databases.
- Protected data access calls `requireSession()` server-side; proxy checks are not an
  authorization boundary.
- `Founder` is the platform authority. Client roles belong to workspace membership and do
  not redefine `user.role`.
- `/dashboard` is the canonical `Pilote` home. Do not create `/dashboard/pilote` or use
  “projet pilote” as a synonym for a client project.
- `backoffice` désigne l’espace privé global ; `dashboard` désigne exclusivement sa
  vue de synthèse générale ; `backend` désigne les couches techniques serveur ;
  `authenticated` décrit uniquement une contrainte d’accès.
- Never hardcode a secret, production URL, user identifier, role, permission, DB value,
  API result, or test result to bypass an invariant.

## Verification

Choose checks proportionally, then prefer the narrowest command that proves the change:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm readiness:static`
- `pnpm readiness`
- `pnpm build`

Before a push, inspect the scoped diff and keep unrelated worktree changes unstaged.
