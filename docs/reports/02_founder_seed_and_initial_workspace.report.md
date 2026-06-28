# Ticket 02 Report - Founder seed and initial workspace

Status: done

## Summary

Ticket 02 replaced the old demo admin seed with the official founder seed. The
seed now requires explicit founder credentials, creates or updates the founder
platform role and credential account idempotently, preserves existing passwords
unless reset is explicit, and creates or updates the initial workspace without
creating founder workspace membership.

## Files Changed

- `scripts/seed.ts`
- `tests/scripts/seed.test.ts`
- `.env.example`
- `README.md`
- `docs/tickets/02_founder_seed_and_initial_workspace.md`
- `docs/tickets/00_roadmap.md`
- `docs/reports/02_founder_seed_and_initial_workspace.report.md`

## Implementation Notes

- Removed the demo admin fallback path and all official use of `ADMIN_EMAIL`,
  `ADMIN_NAME`, `ADMIN_PASSWORD`, `admin@example.local`, and
  `AdminPassword123!` from the seed script.
- Added explicit seed config validation for `DATABASE_URL`, `FOUNDER_EMAIL`,
  `FOUNDER_NAME`, and `FOUNDER_INITIAL_PASSWORD`.
- Added optional `INITIAL_WORKSPACE_NAME` and `INITIAL_WORKSPACE_SLUG`, with
  non-sensitive defaults derived from `PROJECT_SLUG`.
- Upserts the founder user by email and sets `user.role` to `founder`.
- Uses Better Auth `hashPassword` for new credential accounts and for explicit
  password rotation only.
- Preserves existing credential passwords unless `FOUNDER_RESET_PASSWORD=true`.
- Creates or updates the initial workspace by slug with `createdById: null` and
  no workspace membership write.
- Logs founder email, credential status, workspace slug, and workspace name only;
  it does not log plaintext passwords or password hashes.

## Validation Results

- Passed: `pnpm exec vitest run tests/scripts`.
- Passed: `pnpm typecheck`.
- Passed: `pnpm lint`.
- Passed: `pnpm test` with 11 test files and 37 tests.
- Failed: `pnpm readiness`.
  - Prettier still reports pre-existing formatting issues in `AGENT.md`,
    `docs/tickets/03_native_dashboard_shell_and_legacy_crud_removal.md`, and
    `docs/tickets/04_documentation_and_readiness_alignment.md`.
  - Static architecture checks still report pre-existing findings in
    `tests/scripts/assert-safe-db-env.test.ts` for `process.env` and fictive DB
    URL patterns.
  - This ticket's touched files are no longer listed in readiness failures after
    formatting and test adjustments.

## Architecture Compliance

- `pnpm db:seed` remains the single official seed entrypoint and is still guarded
  by `scripts/assert-safe-db-env.ts seed`.
- The seed uses a dedicated Neon/Drizzle connection and closes it explicitly.
- The script imports Drizzle schemas but does not import `{ db }` from
  `@/lib/db`.
- No schema or migration generation was performed by the seed.
- No real seed, migration, deploy, or environment mutation command was run.
- Founder authority is stored only on `user.role`; workspace membership is not
  created for the founder.

## Risks

- Runtime seed execution against a real database was intentionally not performed,
  per ticket constraints. Behavior was validated through focused script tests
  with a fake store and process-level env validation.
- Existing repository readiness remains `NOT_READY` because of unrelated
  formatting and static-rule findings documented above.

## Handoff

Ticket 02 is complete. Do not continue to ticket 03 unless the user starts that
ticket explicitly.
