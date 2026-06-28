# Ticket 01 Report - Platform roles and workspace hierarchy

Status: done

## Summary

Ticket 01 introduced the narrow platform role model and expanded the workspace
membership hierarchy. `founder` now lives on the Better Auth user model as
platform authority, while client roles remain scoped to workspace memberships.

## Files Changed

- `src/lib/auth/index.ts`
- `scripts/generate-auth-schema.ts`
- `src/lib/db/auth-schema.generated.ts`
- `src/lib/db/auth-schema.ts`
- `src/lib/auth/roles.ts`
- `src/features/workspace/schema.ts`
- `src/features/workspace/roles.ts`
- `tests/features/auth/actions.test.ts`
- `tests/features/auth/service.test.ts`
- `tests/features/auth/roles.test.ts`
- `tests/features/workspace/roles.test.ts`
- `docs/tickets/01_platform_roles_and_workspace_hierarchy.md`
- `docs/tickets/00_roadmap.md`
- `docs/reports/01_platform_roles_and_workspace_hierarchy.report.md`

## Implementation Notes

- Added Better Auth `user.additionalFields.role` with `type: "string"`,
  `input: false`, `required: true`, and default `"user"`.
- Regenerated Better Auth schemas through `pnpm auth:generate`; generated
  Drizzle output includes `role: text("role").default("user").notNull()`.
- Expanded `membership_role` to `owner`, `admin`, `manager`, `staff`, `editor`,
  and `viewer`; new memberships default to `viewer`.
- Added platform helpers for `isPlatformRole`, `isFounder`, and
  `canManagePlatformRole`.
- Added workspace role helpers for recognition, ordering, strict workspace role
  management, and the explicit rule that workspace roles never manage platform
  roles.
- Updated existing auth test fixtures to include the default `user` platform
  role.

## Validation Results

- Passed: `pnpm auth:generate`.
- Passed: `pnpm exec vitest run tests/features/auth/roles.test.ts tests/features/workspace/roles.test.ts`.
- Passed: `pnpm lint`.
- Passed after fixture updates: `pnpm typecheck`.
- Passed: `pnpm test` with 10 test files and 31 tests.
- Passed with fictive localhost DB env:
  `APP_ENV=dev CLIENT_SLUG=client PROJECT_SLUG=project DATABASE_URL=postgres://user:pass@localhost:5432/necatech_boilerplate pnpm db:generate`.
- Inspected generated temporary SQL baseline: it contained
  `membership_role` values `owner`, `admin`, `manager`, `staff`, `editor`,
  `viewer`; `workspace_membership.role DEFAULT 'viewer'`; and
  `user.role DEFAULT 'user' NOT NULL`.
- Passed with the temporary Drizzle journal:
  `APP_ENV=dev CLIENT_SLUG=client PROJECT_SLUG=project DATABASE_URL=postgres://user:pass@localhost:5432/necatech_boilerplate pnpm db:check`.
- Restored `src/lib/db/migrations/` to only `.gitkeep` after Drizzle validation,
  preserving the boilerplate empty-migrations rule.
- Failed: `pnpm readiness`.
  - Prettier reported existing formatting issues in `AGENT.md` and tickets
    02-04.
  - Architecture checks reported `tests/scripts/assert-safe-db-env.test.ts` for
    `process.env` usage and fictive PostgreSQL URLs. That file was not changed by
    this ticket and its test data is explicit localhost/fictive guard coverage.

## Architecture Compliance

- Platform authority is represented only by `user.role`.
- No global `admin`, `manager`, `staff`, `editor`, or `viewer` user roles were
  introduced.
- Workspace hierarchy remains scoped to `workspace_membership.role`.
- Founder authority is checked from the explicit platform role only, not from
  email, user id, domain, or workspace membership.
- Better Auth schema files were updated by the repo generation workflow, not by
  manual schema editing.
- No SQL migration baseline is left committed.

## Risks

- `user.role` is stored as text because Better Auth additional field generation
  supports this path directly; application helpers enforce the narrow
  `founder | user` vocabulary.
- `pnpm readiness` remains not-ready because of pre-existing formatting and
  readiness-rule findings outside ticket 01 scope.

## Handoff

Ticket 01 is complete. Do not continue to ticket 02 unless the user starts that
ticket explicitly.
