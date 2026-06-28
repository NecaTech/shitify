# Ticket 04 Report - Documentation and readiness alignment

Status: done

## Summary

Ticket 04 aligned the operational documentation, local agent routing, public
post-clone setup guide, and readiness checks with the native dashboard and
founder seed behavior delivered by tickets 01-03.

## Files Changed

- `README.md`
- `AGENT.md`
- `src/app/page.tsx`
- `scripts/readiness.ts`
- `docs/tickets/04_documentation_and_readiness_alignment.md`
- `docs/tickets/00_roadmap.md`
- `docs/reports/04_documentation_and_readiness_alignment.report.md`

## Implementation Notes

- Updated README setup to cover install, init, env review, Drizzle baseline
  generation/application, `pnpm db:seed`, development server startup, and
  dashboard access.
- Documented founder seed variables, `FOUNDER_RESET_PASSWORD=true`, initial
  workspace variables, and the rule that the founder is not added as a workspace
  member.
- Replaced README's old configurable dashboard and `/dashboard/crud` guidance
  with the native dashboard contract: `/dashboard` is Pilote,
  `/dashboard/administration` is the initial placeholder, and future modules use
  typed features plus dashboard navigation config.
- Documented the operational founder/platform role boundary and workspace role
  hierarchy without expanding README into an RBAC manual.
- Updated the public post-clone guide in `src/app/page.tsx` so it no longer
  references CRUD, includes founder seed env variables, includes
  `pnpm db:generate`, and points authenticated users to `/dashboard`.
- Updated root `AGENT.md` routing so the old CRUD row no longer points to the
  removed `src/features/crud/AGENT.md`.
- Adjusted readiness static checks with a narrow exception for
  `tests/scripts/assert-safe-db-env.test.ts`, where explicit `process.env` and
  production-looking DB URLs are the behavior under test for the DB guard.

## Validation Results

- Passed: `pnpm typecheck`.
- Passed: `pnpm lint`.
- Passed: `pnpm test` with 12 test files and 40 tests.
- Passed: `pnpm readiness`.
  - Status: `PILOT_READY_WITH_WARNINGS`.
  - Remaining warnings: email verification disabled for pilot/local use, CSP
    still allows `unsafe-inline`, CSP `connect-src` is still project-local, and
    7 init-project markers remain outside README.
  - No failures.
- Passed: `pnpm readiness:static`.
  - Status: `PILOT_READY_WITH_WARNINGS`.
  - Same 4 warnings as full readiness.
  - No failures.
- Failed in sandbox: `APP_ENV=dev CLIENT_SLUG=client PROJECT_SLUG=project pnpm build`.
  - Turbopack hit an operation-not-permitted port-binding panic while processing
    `src/styles/globals.css`.
- Passed outside the sandbox: `APP_ENV=dev CLIENT_SLUG=client PROJECT_SLUG=project pnpm build`.
  - Build routes included `/`, `/dashboard`, `/dashboard/administration`,
    `/login`, `/register`, and `/api/auth/[...all]`.

## Architecture Compliance

- README no longer presents configurable CRUD as a native dashboard path.
- Future member invitation/email direction is described as future work only, not
  implemented behavior.
- Local agent routing points future dashboard work toward typed features and ADR
  0001 instead of the deleted CRUD feature.
- The readiness exception is limited to the guard test that proves dangerous
  DB/env cases are rejected; general tests remain covered by the production DB
  leakage check.
- `docs/roadmap.md` still points to `docs/tickets/00_roadmap.md`.

## Risks

- `pnpm readiness` remains warning-only rather than production-ready because
  email verification, CSP hardening, and init-project TODO cleanup are still
  intentionally deferred for client initialization.
- Historical tickets, reports, ADRs, and negative tests still mention CRUD and
  removed routes as history or guard evidence. Current README, public setup
  guidance, and local agent rules no longer present those as official paths.
- No database seed or migration command was run against a real database.

## Handoff

Ticket 04 is complete. Stop after this ticket; do not start another ticket.
