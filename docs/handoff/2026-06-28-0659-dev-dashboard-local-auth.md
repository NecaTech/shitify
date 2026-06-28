# Handoff: Dev Dashboard Local Auth

Created: 2026-06-28 06:59 Europe/Paris
Project: `/home/necatech/Stockage/dev/necatech-boilerplate`
Next session focus: continue polishing and adjusting the boilerplate now that the phase-dev dashboard login works without a client DB.

## Restart Prompt

Continue from `docs/handoff/2026-06-28-0659-dev-dashboard-local-auth.md` and start by reviewing the local dev dashboard experience, then propose and implement the next UI/product adjustments without reintroducing a `DATABASE_URL` requirement in phase `dev`.

## User Goal

- The user wants the boilerplate to be usable immediately after cloning in phase `dev`, with local dashboard access before a client DB exists.
- The project lifecycle must be explicit:
  - `dev`: local development, no required DB URL, local signed founder session.
  - `staging`: after DB URL creation/configuration, real Better Auth + Drizzle + Neon path.
  - `production`: when the client project reaches a deliverable level.
- The user confirmed they can now connect to the dashboard in phase `dev` and wants to continue later with refinements.

## Session Summary

- Initial runtime error was `Invalid environment variables` from `src/lib/env.ts`; `.env.local` lacked `APP_ENV`, `CLIENT_SLUG`, and `PROJECT_SLUG`.
- Added the missing local env values.
- Attempted `pnpm db:seed`, discovered the boilerplate should not require `DATABASE_URL` in phase `dev`.
- Implemented a bounded local auth path for boilerplate dev:
  - `LOCAL_AUTH_ENABLED=true`
  - founder credentials read from `.env.local`
  - signed HTTP-only local session cookie
  - disabled automatically in production
  - Better Auth/Drizzle/Neon path remains authoritative for staging/production.
- Verified actual login with Playwright: `/login` redirects to `/dashboard`, local mode active, Founder badge visible.
- Documented the three-phase lifecycle as the new source of truth.

## Actions Completed

- Added local signed auth support:
  - `src/lib/auth/local.ts`
  - `src/lib/auth/local-cookie.ts`
  - dynamic Better Auth import in `src/lib/auth/server.ts`
  - lazy Better Auth API route in `src/app/api/auth/[...all]/route.ts`
  - proxy recognizes the local cookie presence while `requireSession()` remains the server-side validator.
- Updated login/logout flow:
  - `src/features/auth/actions.ts`
  - `src/features/auth/components/LoginForm.tsx`
  - `src/app/login/page.tsx`
  - `src/features/dashboard/components/DashboardLogoutButton.tsx`
  - `src/features/dashboard/components/DashboardHeader.tsx`
  - `src/features/dashboard/components/DashboardShell.tsx`
- Made `DATABASE_URL` optional in `src/lib/env.ts` for phase `dev`; `src/lib/db/index.ts` now throws a clear error if DB infrastructure is imported without a configured DB URL.
- Added tests/coverage for local session behavior:
  - `tests/features/auth/server.test.ts`
  - `tests/features/auth/actions.test.ts`
  - `tests/proxy.test.ts`
- Documented the lifecycle:
  - `docs/development-phases.md`
  - `README.md`
  - `.env.example`
  - `AGENT.md`
  - `docs/AGENT.md`
  - `src/app/page.tsx`
  - `src/lib/auth/AGENT.md`
  - `src/app/login/AGENT.md`
  - `src/app/api/AGENT.md`
- Removed the generated Drizzle baseline from the diagnostic attempt; `src/lib/db/migrations/` is back to `.gitkeep` only.

## Files And Artifacts

- `docs/development-phases.md`: new durable phase contract. Read this before changing env/auth/DB startup flow.
- `src/lib/auth/local.ts`: local signed session implementation. Redacts DB dependency in dev only.
- `src/lib/auth/server.ts`: decides local auth first when allowed, otherwise imports Better Auth dynamically.
- `src/app/api/auth/[...all]/route.ts`: avoids static Better Auth/DB import when local auth is enabled.
- `src/proxy.ts`: recognizes the local auth cookie for route gating, but does not validate it.
- `.env.example`: describes phase dev/staging/prod env expectations.
- `README.md`: operational setup flow now starts with phase `dev` without DB.
- `src/app/page.tsx`: in-app setup guide aligned with the phase model.
- `.env.local`: contains local-only founder credentials and `LOCAL_AUTH_ENABLED=true`; do not copy secrets into docs or commits.

## Durable References

- `AGENT.md`: root rules, especially “do not reintroduce DB obligation in phase dev”.
- `docs/development-phases.md`: source of truth for dev/staging/production lifecycle.
- `src/lib/auth/AGENT.md`: documents the local auth exception and its bounds.
- `src/app/login/AGENT.md`: login route contract, redirect handling, and local auth exception.
- `src/app/api/AGENT.md`: Better Auth API route must stay lazy in local auth mode.
- `docs/adr/0001-dashboard-modules-use-typed-features.md`: dashboard modules should be typed features, not generic CRUD.
- `docs/adr/0002-founder-is-platform-authority.md`: founder is platform authority, not a workspace role.
- `docs/tickets/00_roadmap.md`: completed ticket context for roles, founder seed, dashboard shell, and docs alignment.

## Commands And Results

- `pnpm db:seed`: failed first because sandbox blocked `tsx` IPC, then reached Neon and failed due invalid DB credentials. This led to the decision that phase `dev` must not require DB.
- `pnpm db:generate`: generated a Drizzle baseline during diagnosis; generated files were later removed because the boilerplate should keep migrations empty.
- `pnpm typecheck`: passed after local auth implementation and docs updates.
- `pnpm lint`: passed after local auth implementation.
- `pnpm test`: passed, 12 files / 42 tests.
- `pnpm readiness:static`: passed with expected warnings, status `PILOT_READY_WITH_WARNINGS`.
- `pnpm build`: passed.
- Playwright login check: passed, reached `http://localhost:3000/dashboard`, local mode true, Founder badge visible.
- `find src/lib/db/migrations -maxdepth 2 -type f | sort`: only `.gitkeep` remains.

## Decisions And Constraints

- Phase `dev` does not require `DATABASE_URL`.
- `LOCAL_AUTH_ENABLED=true` is only for local boilerplate development and must not be used for staging or production validation.
- Local auth uses founder env values from `.env.local`; secrets/passwords must not be committed or repeated in docs.
- Production disables local auth by runtime checks.
- Better Auth/Drizzle/Neon remains the real path from phase `staging`.
- Do not commit a generic migration generated from placeholder slugs.
- Keep `/dashboard` as the Pilote home; do not create `/dashboard/pilote`.
- Do not reintroduce generic CRUD dashboard behavior.

## Current State

- User confirmed they can connect to the dashboard in phase `dev`.
- Dev server was started on `http://localhost:3000` during the session. Check whether it is still running before starting another.
- Worktree is dirty with many changes, including earlier completed ticket work and the new local auth/docs work. Do not revert unrelated user/session changes.
- `.env.local` has local founder credentials. Redact them in any future summary.
- No Drizzle migration baseline is currently present except `.gitkeep`.

## Planned Next Actions

1. Review the dashboard UI/UX in local dev mode and list concrete refinements before editing.
2. If refining dashboard UI, read `src/app/(authenticated)/dashboard/AGENT.md`, `src/features/dashboard/AGENT.md`, `src/components/AGENT.md`, and `src/styles/AGENT.md`.
3. Keep polishing around the phase-dev experience: login page, dashboard home, setup guide, and phase transition messaging.
4. Add focused tests if refinements affect auth redirects, dashboard navigation, or phase behavior.
5. Run at least `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm readiness:static`, and `pnpm build` after code changes.

## Open Questions And Risks

- Decide whether local auth should remain enabled by default in `.env.example` for every clone or whether `init-project` should explicitly ask/generate founder dev credentials.
- Decide how to handle local founder password generation UX in `pnpm init-project`; current `.env.example` only documents the required variables.
- The user wants “peaufiner avec des réajustements” but has not yet specified which dashboard refinements come first.
- `LOCAL_AUTH_ENABLED=true` with missing founder credentials makes local auth unavailable; ensure future docs/UI make that clear enough.

## Suggested Skills

- `diagnose`: use if any local dashboard/auth behavior regresses.
- `prototype`: use if the user wants multiple dashboard UI directions before committing to one.
- `tdd`: use for behavior changes to auth redirects, local session handling, or phase transitions.
- `improve-codebase-architecture`: use if local auth/Better Auth separation starts creating coupling.
- `project-handoff`: use again after the next refinement session.

## Verification

- Done: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm readiness:static`, `pnpm build`, Playwright login check.
- Needed: rerun relevant checks after any next UI/auth/doc refinements.
