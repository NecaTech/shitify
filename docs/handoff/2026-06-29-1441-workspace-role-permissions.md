# Handoff: Workspace Role Permissions

Created: 2026-06-29 14:41 CEST
Project: `/home/necatech/Stockage/dev/necatech-boilerplate`
Next session focus: finish and stabilize configurable workspace roles, then commit/push when the user confirms.

## Restart Prompt

Continue from `docs/handoff/2026-06-29-1441-workspace-role-permissions.md` and verify the configurable workspace-role flow end to end, especially DB migration/seed and the role creation UI in dev.

## User Goal

- The founder remains a platform role for the whole project lifecycle.
- The founder can explore perspectives to verify authorized views.
- The founder/admin must be able to create additional workspace roles, set their navigation permissions, and assign them to registered users.
- Roles must not be hardcoded as fixed perspectives such as `manager`, `staff`, `editor`, `viewer`.
- Role creation must work in `dev` when a DB is configured; dev must still not require a DB just to open the dashboard.

## Session Summary

- A prior commit was pushed to `main`: `6709dff feat: add workspace role perspectives`. It added fixed role perspectives and other dashboard/workspace scaffolding.
- The user corrected the model: roles must be created dynamically and then appear in navigation/perspective exploration.
- Current uncommitted work replaces the fixed perspective model with configurable workspace roles and explicit navigation permissions.
- A runtime DB error occurred on `/dashboard` because optional role loading queried `client_project_dev.workspace` while the configured DB was inaccessible or unmigrated.
- The latest code makes role/workspace reads safe: dashboard stays usable when DB is absent or failing, while role creation remains available in `dev`/`staging` once the DB is valid.

## Actions Completed

- Removed static founder perspective options for `manager`, `staff`, `editor`, and `viewer`.
- Kept bootstrap workspace authority to `owner` and `admin`.
- Added configurable workspace custom roles with explicit permissions:
  - `workspace_custom_role`
  - `workspace_membership_custom_role`
  - `permissions.navigation` currently supports `dashboard` and `administration`.
- Added founder/admin role creation UI in administration via `CreateRoleForm`.
- Changed dashboard view mode to:
  - `founder`
  - `admin`
  - `role:<customRoleId>`
- Added dynamic view options from persisted custom roles.
- Added navigation filtering based on explicit permissions instead of role rank.
- Added backend service/action support for:
  - creating custom workspace roles;
  - assigning a custom role to a workspace membership;
  - assigning bootstrap admin role.
- Added safe loaders in `src/features/dashboard/workspace-role-loading.ts` so optional DB reads return empty arrays instead of crashing the dashboard.
- Generated a Drizzle migration after removing an empty stale `src/lib/db/migrations/meta/` directory:
  - `src/lib/db/migrations/0000_sweet_victor_mancha.sql`
  - `src/lib/db/migrations/meta/0000_snapshot.json`
  - `src/lib/db/migrations/meta/_journal.json`

## Files And Artifacts

- `src/features/workspace/roles.ts`: bootstrap roles, assignable role helpers, dashboard navigation permission types, permission normalization.
- `src/features/workspace/schema.ts`: custom role and membership-custom-role tables; membership enum reduced to `owner | admin`.
- `src/features/workspace/repository.ts`: DB reads/writes for custom roles and custom role assignment.
- `src/features/workspace/service.ts`: founder-only custom role creation, membership custom role assignment, bootstrap role assignment.
- `src/features/workspace/actions.ts`: server actions for admin creation, bootstrap role assignment, custom role creation, custom role assignment.
- `src/features/workspace/types.ts`: custom role summary type.
- `src/features/workspace/AGENT.md`: updated local role contract to bootstrap roles plus custom permissioned roles.
- `src/features/dashboard/view-mode.ts`: dynamic founder/admin/custom-role perspective model.
- `src/features/dashboard/workspace-role-loading.ts`: safe optional DB loading for dashboard role perspectives and administration data.
- `src/features/dashboard/config.ts`: navigation permissions and filtering by selected view option.
- `src/features/dashboard/components/CreateRoleForm.tsx`: new role creation UI.
- `src/features/dashboard/components/DashboardViewSwitch.tsx`: switch now renders supplied view options, not hardcoded role list.
- `src/features/dashboard/components/DashboardShell.tsx`: loads custom role view options safely.
- `src/app/(authenticated)/dashboard/page.tsx`: passes dynamic view options to Pilote.
- `src/app/(authenticated)/dashboard/administration/page.tsx`: loads workspaces/custom roles safely and mounts role/admin forms.
- `tests/features/workspace/roles.test.ts`: bootstrap role and permission normalization coverage.
- `tests/features/workspace/admins.test.ts`: workspace admin creation, custom role creation, and custom role assignment coverage.
- `tests/features/dashboard/navigation.test.ts`: dynamic navigation filtering and dev/staging/prod role-loading guards.
- `src/lib/db/migrations/0000_sweet_victor_mancha.sql`: generated initial migration for current schema state.

## Durable References

- `AGENT.md`: root routing, dev/staging/prod phases, layering rules, and “dev must not require DB” constraint.
- `src/features/workspace/AGENT.md`: local role contract now says bootstrap roles are `owner/admin` and additional roles are permissioned per workspace.
- `src/features/dashboard/AGENT.md`: dashboard is composition/navigation only; real data must come through feature services.
- `docs/adr/0002-founder-is-platform-authority.md`: founder is platform authority, workspace roles must never administer platform roles.
- `docs/development-phases.md`: dev should open without DB, but the user now explicitly wants role creation possible in dev when DB is configured.
- `docs/tickets/01_platform_roles_and_workspace_hierarchy.md`: older completed ticket mentions an expanded fixed role hierarchy; current work deliberately evolves away from that fixed list based on the user’s correction.

## Commands And Results

- `git commit -m "feat: add workspace role perspectives"`: created commit `6709dff`, then pushed to `origin/main`.
- `git push origin main`: pushed `main` from `691cd89` to `6709dff`.
- `pnpm db:generate`: initially failed because `src/lib/db/migrations/meta/_journal.json` was missing in an empty `meta` directory.
- `rmdir src/lib/db/migrations/meta` then `pnpm db:generate`: succeeded and generated `0000_sweet_victor_mancha.sql`.
- `pnpm db:migrate`: failed with `password authentication failed for user 'neondb_owner'`. This happened even with escalated network access, so the local `.env.local` `DATABASE_URL` appears invalid or stale. Do not expose the URL/password.
- `pnpm verify:dashboard-local`: passed after safe loader fix with `{"ok":true,"url":"http://localhost:3000/dashboard","login":true,"viewSwitch":true,"administrationFounderAction":true}`.
- `pnpm typecheck`: passed after latest changes.
- `pnpm lint`: passed after latest changes.
- `pnpm test`: passed after latest changes, 13 files / 57 tests.

## Decisions And Constraints

- Do not reintroduce fixed role perspectives like `manager`, `staff`, `editor`, `viewer`.
- Role creation must be possible in `dev` and `staging` when `DATABASE_URL` is configured.
- Dashboard access in `dev` must remain possible without DB.
- Optional role loading must not crash the dashboard if DB is absent, inaccessible, or unmigrated.
- Actual creation/mutation still requires a valid DB. Current `.env.local` Neon password is rejected.
- Founder remains `user.role = "founder"` and must not become a workspace membership shortcut.
- Custom roles are workspace-scoped and permission-based; current implemented permission surface is navigation only.
- `createWorkspaceAdminAction` is still staging-only. The user only corrected role creation for dev; do not assume admin user creation should also be dev-enabled unless asked.
- Migrations were generated by Drizzle, not written manually.

## Current State

- Worktree is dirty with uncommitted implementation and generated migration files.
- There is a running Next dev server on port `3000` from an external terminal.
- `/dashboard` no longer crashes from the DB query path; anonymous curl redirects to login as expected, and `pnpm verify:dashboard-local` passes.
- `pnpm db:migrate` cannot be completed until `.env.local` has a valid `DATABASE_URL`.
- Because DB migration is not applied, creating roles through the UI will still fail at mutation time until the database credentials/migrations are fixed.

## Planned Next Actions

1. Decide whether to keep the generated initial migration in this boilerplate branch or defer/remove it according to boilerplate migration policy. Read `docs/development-phases.md` and `src/lib/db/AGENT.md` before deciding.
2. Fix `.env.local` `DATABASE_URL` or point it at a valid local/dev database, then run `pnpm db:migrate`.
3. Run `pnpm db:seed` if the target DB lacks founder/workspace records needed for role creation UI.
4. Test the role creation UI in `/dashboard/administration` with the valid DB.
5. Add UI for assigning a custom role to an existing member if the user wants it now; backend action/service exists, but no member list/assignment form was built in this session.
6. Re-run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm verify:dashboard-local`.
7. Commit and push only after confirming migration policy and DB behavior.

## Open Questions And Risks

- Should the generated `0000_sweet_victor_mancha.sql` be committed in the reusable boilerplate, or should migrations remain empty until client initialization? The docs currently warn against committing a generic boilerplate migration generated from placeholder schema.
- The user asked to “fais le” for resolving DB error, but the current Neon password in `.env.local` is rejected. A fresh valid `DATABASE_URL` is needed to actually migrate.
- Custom role assignment has backend support but no complete UI for selecting a registered user/member and assigning a custom role.
- The older ticket `01` and ADR language mention fixed role examples; local `src/features/workspace/AGENT.md` has been updated, but broader docs may need reconciliation.
- Safe loaders currently swallow optional DB read errors to keep dev dashboard open. If deeper observability is needed, add a non-sensitive warning pattern carefully.

## Suggested Skills

- `diagnose`: use if the DB/runtime error persists after changing `DATABASE_URL`; reproduce with `pnpm db:migrate` and `/dashboard`.
- `tdd`: use if building the member-role assignment UI, because the backend exists and the UI should be behavior-driven.
- `agents-dispatch`: use if documenting the new workspace role model across local `AGENT.md` files.
- `boilerplate-maturation`: use before committing generated migrations, because boilerplate migration policy is sensitive.
- `github:yeet`: use only when the user explicitly asks to commit/push/PR the final uncommitted changes.

## Verification

- Done:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm exec vitest run tests/features/dashboard/navigation.test.ts`
  - `pnpm verify:dashboard-local`
  - `pnpm db:generate`
- Failed / blocked:
  - `pnpm db:migrate`: blocked by invalid/stale Neon credentials in `.env.local`.
- Needed:
  - `pnpm db:migrate` with valid dev DB credentials.
  - `pnpm db:seed` if testing DB-backed founder/workspace role creation.
  - Manual or Playwright verification of creating a custom role in `/dashboard/administration`.
