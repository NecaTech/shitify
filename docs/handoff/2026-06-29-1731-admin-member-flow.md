# Handoff: Admin Member Flow

Created: 2026-06-29 17:31 CEST
Project: `/home/necatech/Stockage/dev/necatech-boilerplate`
Next session focus: fix the DB-backed login path for dev-created admin/member accounts, then finish runtime verification and prepare a clean commit.

## Restart Prompt

Continue from `docs/handoff/2026-06-29-1731-admin-member-flow.md` and start by diagnosing why a workspace admin created through the local DB administration UI cannot log in in `APP_ENV=dev` with `LOCAL_AUTH_ENABLED=true`; preserve the no-generated-migrations boilerplate rule.

## User Goal

- Founder remains platform authority and is not a workspace member.
- Founder creates/configures/deletes admins, workspaces, and workspace custom roles.
- Admin profile must be different from founder:
  - admin Pilote is a business activity overview;
  - admin Administration manages members only.
- Admin can create, edit, delete members and assign existing founder-created custom roles.
- UI must be sober: create buttons, clickable rows, pop-up configuration, styled central confirmation dialog before destructive actions.
- Boilerplate maturation work must remain commit-ready and reusable for later project/business invariants.

## Session Summary

- Continued from the prior local DB / role flow work.
- Replaced always-visible role form with compact role management in a pop-up.
- Added management pop-ups for admins, workspaces, roles, and members.
- Added styled `ConfirmDialog` instead of native `window.confirm`.
- Split founder and admin dashboards: founder sees structural boilerplate/admin controls; admin sees a business-overview Pilote and member management.
- Added `member` as a workspace bootstrap membership role so admins can manage users who then receive custom business roles.
- Local DB schema was pushed with `db:push` for the enum/default change; no migration files were generated or committed.

## Actions Completed

- Local DB support and dynamic role model from earlier session remained in place:
  - local Docker Postgres helpers;
  - `pg` local driver selection;
  - safe `db:push --force` guarded by `assert-safe-db-env.ts`;
  - dynamic custom workspace roles with navigation permissions.
- UI:
  - deleted old `CreateAdminForm`;
  - added `AdminManagement`, `WorkspaceManagement`, `RoleManagement`, `MemberManagement`, `ConfirmDialog`, `AssignRoleForm`;
  - ordered founder administration sections as `Admins workspace`, `Workspaces`, `Roles workspace`;
  - admin administration shows `Membres` only;
  - admin Pilote shows `Pilote admin`, members, activity, and administration overview rather than founder boilerplate checklist.
- Workspace domain:
  - added `member` to `membership_role`;
  - default `workspace_membership.role` is now `member`;
  - custom roles remain separate DB rows created only by founder;
  - admins can manage `member` memberships and assign existing custom roles;
  - founder can manage admins/workspaces/custom roles.
- Deletion behavior:
  - deleting an admin removes workspace membership, not the global user account;
  - deleting a workspace relies on DB cascade for memberships/custom roles;
  - deleting a custom role relies on DB cascade for role assignments;
  - deleting a member removes workspace membership.

## Files And Artifacts

- `src/features/workspace/schema.ts`: added `member` to `membership_role`; default membership role changed to `member`; custom role tables remain workspace-scoped.
- `src/features/workspace/roles.ts`: hierarchy is now `owner > admin > member`; assignable bootstrap roles include `admin` and `member`.
- `src/features/workspace/repository.ts`: workspace/admin/member/custom-role create/update/delete persistence helpers.
- `src/features/workspace/service.ts`: founder-only structural management; admin member management; member custom role assignment.
- `src/features/workspace/actions.ts`: server actions for admins, workspaces, members, custom roles, assignments, deletes.
- `src/features/dashboard/components/*Management.tsx`: pop-up CRUD/configuration components.
- `src/features/dashboard/components/ConfirmDialog.tsx`: centered styled destructive confirmation dialog.
- `src/features/dashboard/components/PiloteHome.tsx`: separate founder vs admin pilot surfaces.
- `src/features/dashboard/components/AdministrationPlaceholder.tsx`: founder/admin section split and ordering.
- `src/features/dashboard/workspace-role-loading.ts`: safe DB loading for dashboard/admin surfaces.
- `scripts/local-db-env.ts`, `scripts/local-db-docker.ts`: local DB support.
- `src/lib/db/database-url.ts`, `src/lib/db/index.ts`: local vs remote DB driver selection.
- `tests/features/workspace/admins.test.ts`, `tests/features/workspace/roles.test.ts`, `tests/features/dashboard/navigation.test.ts`: updated coverage.
- `docs/handoff/2026-06-29-1441-workspace-role-permissions.md`, `docs/handoff/2026-06-29-1557-local-db-role-flow.md`: earlier handoffs still untracked; decide whether to commit them.

## Durable References

- `AGENT.md`: architecture boundaries, phase rules, no DB required in dev, no hardcoded roles/secrets, no generated migrations in boilerplate unless initialized client project.
- `src/features/workspace/AGENT.md`: founder remains outside memberships; workspace roles/memberships must never administer platform roles. Note: file still says bootstrap roles are `owner` and `admin`; update it to include `member` before commit.
- `src/features/dashboard/AGENT.md`: dashboard must not read DB directly and must avoid fake metrics.
- `src/lib/db/AGENT.md`: keep `src/lib/db/migrations/` empty except `.gitkeep`; Drizzle migrations are generated per client project after init.
- `docs/development-phases.md`: dev can run without DB; optional local DB is allowed for pre-clone persistence invariants.
- `docs/adr/0002-founder-is-platform-authority.md`: founder is platform authority; workspace roles must not demote/delete/administer founder.

## Commands And Results

- `pnpm db:push`: passed against local DB and applied `ALTER TYPE membership_role ADD VALUE 'member'` plus default/FK updates; no migration file generated.
- `pnpm typecheck`: passed after admin/member split.
- `pnpm lint`: passed.
- `pnpm test`: passed, 15 test files / 75 tests.
- `pnpm readiness:static`: passed as `PILOT_READY_WITH_WARNINGS` with existing warnings for email verification, CSP, and TODO(init-project).
- `git diff --check`: passed.
- `find src/lib/db/migrations -maxdepth 3 -type f -print`: only `.gitkeep`.
- Playwright checks passed earlier for:
  - role pop-up creation/list/edit behavior;
  - central styled `alertdialog`;
  - founder administration order and CRUD flow.
- Playwright admin login attempt failed:
  - after creating an admin through founder UI, clearing cookies, and logging in as that admin, `/login` stayed on page and showed `Identifiants invalides`;
  - a direct debug login with a placeholder admin email also showed `Identifiants invalides`;
  - likely local-auth/DB-backed-auth integration issue in dev, not a dashboard UI issue.

## Decisions And Constraints

- Founder-only:
  - create/configure/delete admins;
  - create/configure/delete workspaces;
  - create/configure/delete custom workspace roles.
- Admin-only scope:
  - create/configure/delete members in accessible workspace;
  - assign existing custom roles created by founder.
- `member` is a bootstrap workspace membership role, not a business custom role.
- Custom roles remain permission-bearing rows under `workspace_custom_role`.
- Do not reintroduce fixed business roles like `manager`, `staff`, `editor`, `viewer`.
- Do not make founder an implicit workspace member.
- Do not commit generated Drizzle migrations from boilerplate maturation.
- Admin/member account login must be real before claiming full runtime verification.

## Current State

- Worktree is dirty and uncommitted.
- Local Postgres container appears available on `localhost:54329`.
- `.env.local` points to local DB and contains sensitive founder/auth values; do not print or commit it.
- Local DB schema has been pushed and now includes `membership_role = owner/admin/member`.
- Local DB contains extra records created during Playwright checks, including generated admins/workspaces/roles/members.
- `src/lib/db/migrations/` still contains only `.gitkeep`.
- The admin profile UI/code is implemented, but full login-based runtime verification is blocked by invalid admin credentials in the current dev auth path.

## Planned Next Actions

1. Read `src/features/auth/AGENT.md`, `src/lib/auth/AGENT.md`, and relevant login/auth service files.
2. Diagnose why dev-created DB credential accounts cannot authenticate while `LOCAL_AUTH_ENABLED=true`.
3. Decide whether dev local auth should:
   - keep founder env login only and explicitly not support DB users; or
   - fall through to DB-backed Better Auth/local DB for non-founder accounts when `DATABASE_URL` exists.
4. Implement the chosen auth path with tests.
5. Run a full Playwright admin flow:
   - founder creates custom role and admin;
   - admin logs in;
   - admin sees `Pilote admin`, not `Pilote founder`;
   - admin Administration shows `Membres`, not founder structural sections;
   - admin creates/edits/deletes member and assigns an existing role.
6. Update `src/features/workspace/AGENT.md` to mention bootstrap role `member`.
7. Review the full diff, decide whether to include earlier handoff files, then stage/commit when approved.

## Open Questions And Risks

- Auth blocker: admin users created in local DB cannot currently log in during dev local-auth mode. This blocks full runtime proof of the admin profile.
- `src/features/workspace/AGENT.md` is now stale because it says bootstrap roles are only `owner` and `admin`; update before commit.
- Local DB contains test records from Playwright checks. This is acceptable locally but avoid implying seeded fixture state in docs.
- The admin Pilote currently uses sober placeholder business-overview cards, not real business metrics. This matches dashboard AGENT rules and should stay non-fake until business features exist.
- `db:push` was used locally and is guarded; do not weaken guard or run against shared/staging/prod DB.

## Suggested Skills

- `diagnose`: use for the admin login failure; reproduce, trace auth flow, patch correct layer.
- `project-handoff`: use again if auth diagnosis becomes long before commit.
- `boilerplate-maturation`: use if extracting the admin/member Playwright flow into a reusable invariant script/test.

## Verification

- Done:
  - `pnpm db:push`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm readiness:static`
  - `git diff --check`
  - migration directory check: only `.gitkeep`
  - Playwright UI checks for founder CRUD/order and styled confirmation dialog
- Needed:
  - fix/decide admin DB-backed login behavior in dev;
  - rerun full Playwright admin profile/member-management flow after auth fix;
  - update stale workspace AGENT role wording;
  - final diff review and commit staging decision.
