# Handoff: Local DB Role Flow

Created: 2026-06-29 15:57 CEST
Project: `/home/necatech/Stockage/dev/necatech-boilerplate`
Next session focus: review/stabilize the uncommitted configurable workspace-role and local pre-clone DB work, then commit/push when the user confirms.

## Restart Prompt

Continue from `docs/handoff/2026-06-29-1557-local-db-role-flow.md` and start by reviewing the dirty worktree, especially the local DB support and configurable workspace-role flow. Preserve the rule that the boilerplate commits no generated Drizzle migrations.

## User Goal

- Founder remains the platform role for the full project lifecycle.
- Founder can explore role perspectives to verify authorized dashboard views.
- Founder/admin can create additional workspace roles, set navigation permissions, and assign custom roles to registered workspace members.
- Roles must be dynamic, not hardcoded fixed perspectives like `manager`, `staff`, `editor`, `viewer`.
- Role creation must work in `dev` when a DB is configured, while `/dashboard` must still open in `dev` without requiring DB.
- Because many pre-clone boilerplate invariants require real persistence, the boilerplate needs a local DB path before client project cloning.

## Session Summary

- Continued from `docs/handoff/2026-06-29-1441-workspace-role-permissions.md`.
- Replaced the earlier fixed role perspective model with dynamic workspace custom roles and explicit dashboard navigation permissions.
- Added a local PostgreSQL pre-clone path based on Docker and `pg`, because the existing Neon `DATABASE_URL` was stale/invalid.
- Created and verified a real custom role through the UI against the local DB on `http://localhost:3000`.
- Kept `src/lib/db/migrations/` empty except `.gitkeep`; no generated Drizzle migration should be committed from this boilerplate work.

## Actions Completed

- Added configurable custom workspace roles:
  - tables: `workspace_custom_role`, `workspace_membership_custom_role`;
  - permissions: `permissions.navigation` currently supports `dashboard` and `administration`;
  - view modes: `founder`, `admin`, and `role:<customRoleId>`.
- Added role creation and assignment support:
  - service/repository/action support for creating custom roles;
  - service/repository/action support for assigning custom roles to memberships;
  - `CreateRoleForm` and `AssignRoleForm` in dashboard administration.
- Opened custom role creation to platform founder and workspace `owner/admin`.
- Fixed local-auth founder creation path:
  - local auth session uses `local_founder`, which is not a DB user id;
  - for platform founder-created custom roles, `createdById` is now `null`;
  - workspace admin-created roles still record the real DB user id.
- Added safe dashboard role loaders so optional DB reads do not crash the dashboard when DB is missing, inaccessible, or unmigrated.
- Added local DB support:
  - `scripts/local-db-env.ts` prepares `.env.local` for local DB without overwriting sensitive auth/founder values;
  - `scripts/local-db-docker.ts` manages a Docker Postgres container without Docker Compose;
  - `pnpm db:local:env`, `pnpm db:local:up`, `pnpm db:local:down`;
  - `pg` and `@types/pg` dependencies;
  - `src/lib/db/database-url.ts` classifies DB URLs;
  - runtime DB and seed choose `pg` for local DB and Neon serverless for remote DB.
- Added `schemaFilter` to `drizzle.config.ts` and exported `appSchema` from `src/lib/db/schema.ts`; this made `pnpm db:push` work cleanly against the local schema.
- Added `--force` to `pnpm db:push`; this is guarded by `scripts/assert-safe-db-env.ts` and remains allowed only in `APP_ENV=dev`.
- Added user `necatech` to the `docker` group. Existing Codex shell did not inherit it, so `sg docker -c ...` was used for Docker commands in this session.

## Files And Artifacts

- `.env.example`: documents optional local DB pre-clone flow.
- `README.md`: documents local DB flow and baseline migration policy. Note: an older roles paragraph still mentions fixed roles and needs reconciliation.
- `docs/development-phases.md`: documents optional local DB in phase `dev`.
- `drizzle.config.ts`: now filters the concrete application schema.
- `package.json`, `pnpm-lock.yaml`: add `pg`, `@types/pg`, and local DB scripts.
- `scripts/assert-safe-db-env.ts`: uses `pg` for local schema creation and Neon for remote schema creation.
- `scripts/seed.ts`: uses `pg` for local DB and Neon for remote DB.
- `scripts/local-db-env.ts`: writes local DB env defaults, preserving sensitive values.
- `scripts/local-db-docker.ts`: starts/stops the local Postgres Docker container.
- `src/lib/db/database-url.ts`: shared DB URL classification.
- `src/lib/db/index.ts`: runtime driver selection for local vs remote DB.
- `src/lib/db/schema.ts`: exports `appSchema` so Drizzle sees the schema during push.
- `src/features/workspace/*`: dynamic bootstrap/custom role model, schema, repository, service, actions, types.
- `src/features/dashboard/*`: dynamic view options, safe role loaders, navigation filtering, create/assign role UI, local DB label.
- `tests/features/workspace/admins.test.ts`: role creation/assignment and workspace filtering coverage.
- `tests/features/workspace/roles.test.ts`: role/permission normalization coverage.
- `tests/features/dashboard/navigation.test.ts`: dynamic navigation filtering and DB-loading guard coverage.
- `tests/scripts/local-db-env.test.ts`: local env helper coverage.
- `tests/scripts/local-db-docker.test.ts`: Docker helper coverage with fake Docker.
- `docs/handoff/2026-06-29-1441-workspace-role-permissions.md`: previous handoff that explains the earlier state and stale Neon credential issue.

## Durable References

- `AGENT.md`: root architecture, phase rules, no DB requirement in dev, layering, and no hardcoding.
- `src/lib/db/AGENT.md`: boilerplate must keep `src/lib/db/migrations/` empty outside `.gitkeep`; migrations are generated per initialized client project.
- `scripts/AGENT.md`: scripts must parse env explicitly, not import `@/lib/env`, and must keep DB commands guarded.
- `src/features/workspace/AGENT.md`: platform founder is outside memberships; workspace roles are bootstrap `owner/admin` plus custom permissioned roles.
- `src/features/dashboard/AGENT.md`: dashboard composes UI/navigation and must not read DB directly.
- `docs/adr/0002-founder-is-platform-authority.md`: founder is platform authority and workspace roles must never administer platform roles.
- `docs/development-phases.md`: now documents dev without DB and optional local DB for pre-clone persistence checks.
- `README.md`: local DB instructions and migration baseline policy live here; roles section still has stale fixed-role wording.

## Commands And Results

- `pnpm db:local:env -- --force`: updated `.env.local` to point to the local DB and preserved existing sensitive auth/founder values.
- `sudo usermod -aG docker necatech`: added user to Docker group. Current shell still needed `sg docker`.
- `sg docker -c 'pnpm db:local:up'`: created/runs container `necatech-boilerplate-postgres`.
- `sg docker -c 'docker exec necatech-boilerplate-postgres pg_isready -U necatech -d necatech_boilerplate'`: local DB accepting connections.
- Initial `pnpm db:push`: first failed in sandbox due `tsx` IPC permission, then with Neon serverless local connection `ErrorEvent`, then with Drizzle prompt/no TTY, then with schema filter issues. These were fixed by adding `pg`, `--force`, `schemaFilter`, and exporting `appSchema`.
- Final `pnpm db:push`: passed and applied all schema objects to `client_project_dev`.
- Final `pnpm db:seed`: passed; founder and initial workspace were created in the local DB. Do not expose founder password.
- Playwright role flow on `http://localhost:3000`: passed with a generated role name; role appeared on `/dashboard` and DB label showed `locale configurée`.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.
- `pnpm test`: passed, 15 files / 64 tests.
- `pnpm verify:dashboard-local`: passed.
- `find src/lib/db/migrations -maxdepth 3 -type f -print`: only `.gitkeep`.

## Decisions And Constraints

- Do not reintroduce fixed role perspectives (`manager`, `staff`, `editor`, `viewer`) as code behavior.
- Founder remains `user.role = "founder"` and must not become an implicit workspace member.
- Custom roles are workspace-scoped and permission-based. Current permission surface is dashboard navigation only.
- Dashboard in `dev` must open without DB; optional DB reads must fail safe.
- Real role creation in `dev` requires configured DB, schema push/migration, and seeded workspace.
- For pre-clone boilerplate invariants, use local DB with `APP_ENV=dev` and `db:push`; do not generate or commit migrations.
- `db:push --force` is acceptable only because `assert-safe-db-env.ts` blocks it outside `APP_ENV=dev`.
- Remote/Neon paths should still use Neon serverless driver; local Docker Postgres uses `pg`.
- The local DB uses port `54329` to avoid common local Postgres conflicts.

## Current State

- Worktree is dirty and uncommitted.
- Next dev server is running on `http://localhost:3000`.
- Local Docker Postgres container `necatech-boilerplate-postgres` is running on `localhost:54329`.
- `.env.local` currently points to local DB and contains preserved sensitive values; do not print or commit it.
- Local schema `client_project_dev` exists and is seeded.
- `client_project_dev.workspace_custom_role` contains 1 role created by the final UI test.
- `src/lib/db/migrations/` contains only `.gitkeep`.
- The old Neon `DATABASE_URL` issue is no longer blocking local pre-clone checks, but remote Neon credentials were not fixed.

## Planned Next Actions

1. Review the full diff for coherence and remove any accidental stale wording, especially README role hierarchy text that still mentions `manager/staff/editor/viewer`.
2. Decide whether to keep the previous handoff file `docs/handoff/2026-06-29-1441-workspace-role-permissions.md` in the commit or leave it untracked.
3. Run `pnpm readiness:static` or full `pnpm readiness`; current completed checks did not include readiness after the final local DB changes.
4. Optionally add a reusable scripted Playwright verification for the local DB role creation flow instead of keeping it as an ad hoc command.
5. If the user confirms, stage only relevant files, commit, and push.

## Open Questions And Risks

- README has stale role hierarchy wording under "Rôles et seed founder"; it conflicts with the new dynamic custom-role model and should be corrected before commit.
- `pnpm db:check` is still not suitable for the boilerplate empty-migrations state because it expects `src/lib/db/migrations/meta/_journal.json`.
- `db:push --force` is guarded but still powerful; future agents should not weaken the guard.
- Existing Codex shell did not inherit the Docker group. New shells after user relogin should have direct Docker access; otherwise use `sg docker -c`.
- A formal E2E/local invariant script for role creation may be worth adding.
- No commit/push has been performed.

## Suggested Skills

- `project-handoff`: use again if the next session also becomes long before commit.
- `boilerplate-maturation`: use if turning the ad hoc local DB role verification into a reusable boilerplate invariant test/script.
- `diagnose`: use if `db:push`, seed, or runtime DB driver selection regresses.
- `github:yeet`: use only if the user explicitly asks to commit/push/open PR.

## Verification

- Done:
  - `pnpm db:local:env -- --force`
  - `sg docker -c 'pnpm db:local:up'`
  - final `pnpm db:push`
  - final `pnpm db:seed`
  - Playwright real UI role creation and dashboard visibility check on `http://localhost:3000`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm verify:dashboard-local`
  - migration directory check: only `.gitkeep`
- Needed:
  - `pnpm readiness:static` or `pnpm readiness`
  - final diff review
  - optional scripted local DB role-flow verification
