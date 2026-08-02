# NecaTech Boilerplate

## Start here

This repository is the reusable NecaTech boilerplate. Before changing a path, read this
file and every nearer `AGENTS.md` from the repository root to that path. The nearest
contract refines its ancestors; it does not replace repository-wide invariants.

The remote determines the work mode:

- a remote containing `necatech-boilerplate` means `boilerplate-source`;
- another project remote means `client-project`;
- no remote means the project context is incomplete.

In `boilerplate-source`, mature reusable foundations locally with `APP_ENV=dev`. Staging
and production belong to initialized client projects. Do not run `pnpm init-project` to
work on the source boilerplate itself.

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
