# Ticket 03 Report - Native dashboard shell and legacy CRUD removal

Status: done

## Summary

Ticket 03 replaced the old configurable dashboard and legacy CRUD prototype with
a native dashboard shell. `/dashboard` is now the Pilote home, the dashboard has
desktop and mobile navigation chrome, `/dashboard/administration` exists as a
real placeholder, and the CRUD route, feature, and schema aggregate export have
been removed.

## Files Changed

- `src/app/(authenticated)/dashboard/layout.tsx`
- `src/app/(authenticated)/dashboard/page.tsx`
- `src/app/(authenticated)/dashboard/administration/page.tsx`
- `src/app/(authenticated)/dashboard/crud/page.tsx`
- `src/features/dashboard/config.ts`
- `src/features/dashboard/types.ts`
- `src/features/dashboard/components/AdministrationPlaceholder.tsx`
- `src/features/dashboard/components/DashboardHeader.tsx`
- `src/features/dashboard/components/DashboardLogoutButton.tsx`
- `src/features/dashboard/components/DashboardNav.tsx`
- `src/features/dashboard/components/DashboardShell.tsx`
- `src/features/dashboard/components/PiloteHome.tsx`
- `src/features/dashboard/components/DashboardHome.tsx`
- `src/features/crud/*`
- `src/lib/db/schema.ts`
- `tests/features/dashboard/navigation.test.ts`
- `docs/tickets/03_native_dashboard_shell_and_legacy_crud_removal.md`
- `docs/tickets/00_roadmap.md`
- `docs/reports/03_native_dashboard_shell_and_legacy_crud_removal.report.md`

## Implementation Notes

- Added a dashboard-specific layout under `(authenticated)/dashboard` while
  keeping the parent authenticated layout as the auth boundary.
- Added a compact shell with desktop sidebar, mobile bottom navigation, route
  title, user name, founder badge when `session.user.role` is the platform
  `founder` role, and logout.
- Centralized dashboard navigation in `src/features/dashboard/config.ts` as a
  typed `link | group` union. The current visible links are `Pilote` and
  `Administration`.
- Replaced the previous configurable dashboard home with generic Pilote content
  that has no fake metrics, demo copy, project-pilot wording, seed references,
  or email display.
- Added an Administration placeholder with no fake member data and no visible
  unwired actions.
- Removed `/dashboard/crud`, `src/features/crud`, and the CRUD schema aggregate
  export from `src/lib/db/schema.ts`.
- Added tests that assert the native nav routes, absence of `/dashboard/pilote`,
  absence of `/dashboard/crud`, absence of `src/features/crud`, and route-title
  resolution.

## Validation Results

- Passed: `pnpm typecheck`.
- Passed: `pnpm lint`.
- Passed: `pnpm exec vitest run tests/features/dashboard/navigation.test.ts`.
- Passed: `pnpm test` with 12 test files and 40 tests.
- Passed with required local env outside the sandbox:
  `APP_ENV=dev CLIENT_SLUG=client PROJECT_SLUG=project pnpm build`.
- Passed:
  `APP_ENV=dev CLIENT_SLUG=client PROJECT_SLUG=project DATABASE_URL=postgres://user:pass@localhost:5432/necatech_boilerplate pnpm db:generate`.
- Inspected generated temporary SQL baseline: it listed 14 non-CRUD tables and
  no `resource`, `resource_field`, `resource_record`, or CRUD enum/table output.
- Restored `src/lib/db/migrations/` to only `.gitkeep` after Drizzle
  inspection, preserving the boilerplate empty-migrations rule.
- Failed first sandbox build attempt: Turbopack hit an operation-not-permitted
  port-binding panic while processing CSS. The same build passed outside the
  sandbox with the required env values.
- Failed: `pnpm readiness`.
  - Prettier still reports formatting issues in `AGENT.md` and
    `docs/tickets/04_documentation_and_readiness_alignment.md`; those files
    were not changed by ticket 03 implementation.
  - Architecture checks still report
    `tests/scripts/assert-safe-db-env.test.ts` for explicit `process.env` usage
    and fictive PostgreSQL URLs. That file was not changed by ticket 03 and is
    the existing DB guard test coverage.

## Architecture Compliance

- Protected dashboard routes remain under `(authenticated)` and the dashboard
  shell calls `requireSession()` server-side.
- Dashboard `page.tsx` files remain composition-only and do not import
  repositories, Drizzle, or `db`.
- Active navigation state uses `usePathname()` only in client navigation
  components.
- The mobile bottom navigation contains section links only and does not expose
  logout.
- The founder badge is derived from the explicit platform role helper, not from
  email, id, domain, or workspace membership.
- No SQL migration baseline is left committed.

## Risks

- `pnpm readiness` remains not-ready because of existing readiness-rule and
  formatting findings outside this ticket's implementation surface.
- The Administration page is intentionally a placeholder until a future member
  invitation and permission flow is defined.
- No browser screenshot was captured; coverage here is type/lint/unit/build plus
  route/config tests.

## Handoff

Ticket 03 is complete. Do not continue to ticket 04 unless the user starts that
ticket explicitly.
