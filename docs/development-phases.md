# Client Project Development Phases

This boilerplate is designed to move through three explicit phases after it is
cloned for a client project. The phase determines whether the dashboard uses the
local boilerplate session or the real DB-backed Better Auth flow.

## Phase 1 - Dev

Goal: start product development immediately after cloning, before a client DB
exists.

Use:

- `APP_ENV=dev`
- `LOCAL_AUTH_ENABLED=true`
- `FOUNDER_EMAIL`, `FOUNDER_NAME`, and `FOUNDER_INITIAL_PASSWORD` in
  `.env.local`
- no required `DATABASE_URL`

Behavior:

- `/login` accepts the local founder credentials from `.env.local`.
- The app creates a signed local session cookie using `BETTER_AUTH_SECRET`.
- `/dashboard` opens without Neon, Drizzle migrations, or `pnpm db:seed`.
- Better Auth API routes remain inactive in local auth mode.

Allowed work:

- build the public site, dashboard shell, UI, navigation, and local-only product
  surfaces;
- add typed features, schemas, services, and tests;
- keep DB-dependent workflows behind services/repositories until staging.

Do not:

- treat the local auth session as a client production mechanism;
- create fake DB records to make the boilerplate dashboard open;
- require a Neon URL before the project reaches staging.

## Phase 2 - Staging

Goal: connect the client project to its first real database and make the
DB-backed app path authoritative.

Entry criteria:

- a Neon/PostgreSQL database has been created;
- `DATABASE_URL` is available and written to `.env.local` or the staging
  environment;
- `CLIENT_SLUG`, `PROJECT_SLUG`, and `APP_ENV=staging` identify the target
  schema.

Required transition:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Then set:

```env
LOCAL_AUTH_ENABLED=false
```

Behavior:

- Better Auth and Drizzle use the real DB.
- `pnpm db:seed` creates or updates the founder account and initial workspace.
- `/login` uses the DB-backed Better Auth email/password flow.
- The generated Drizzle baseline belongs to the client project, not to the
  reusable boilerplate baseline.

Allowed work:

- validate real auth, workspace, persistence, and integration behavior;
- configure Vercel preview/staging env vars;
- run readiness, tests, and builds against the staging configuration.

Do not:

- keep relying on `LOCAL_AUTH_ENABLED=true` for client validation;
- commit a generic boilerplate migration generated from a placeholder schema;
- run destructive DB operations without the guard confirmations documented in
  `scripts/assert-safe-db-env.ts`.

## Phase 3 - Production

Goal: ship once the client project is considered deliverable.

Entry criteria:

- the staging flow has been validated with the real DB;
- founder access works through Better Auth;
- environment variables are configured in Vercel production;
- production risk items such as email verification, CSP, external domains, and
  DB separation have been reviewed.

Required posture:

- `APP_ENV=prod`
- `LOCAL_AUTH_ENABLED=false`
- production `DATABASE_URL`
- production `BETTER_AUTH_SECRET`
- canonical `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`

Behavior:

- the local boilerplate auth path is disabled by runtime checks;
- all private routes require the DB-backed `requireSession()` path;
- DB changes go through generated Drizzle migrations and guarded commands.

Do not:

- enable local auth in production;
- use a dev/staging password as the production founder password;
- promote a project while readiness checks still show production-relevant
  failures.
