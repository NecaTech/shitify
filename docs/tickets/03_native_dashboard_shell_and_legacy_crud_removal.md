# Ticket 03 - Native dashboard shell and legacy CRUD removal

Ticket ID: 03

## Status

done

## Contract Summary

- Execute only ticket 03.
- Do not continue to ticket 04.
- Completion requires implementation, validation evidence, report update, and roadmap/status updates.

## Source Issue

Quick ticket - no source issue

## Preparation Mode

quick

## Type

ui, page, integration

## Goal

Replace the old configurable dashboard and CRUD prototype with a native generic
dashboard shell. `/dashboard` must be the Pilote home, with responsive desktop
sidebar, mobile bottom navigation, compact useful header, and an Administration
placeholder ready for future member management.

## Execution Contract

This ticket is executed by launching `/goal 03` in a fresh session. The executor
must locate exactly one `docs/tickets/03_*` ticket, read it, read the required
references, implement only this ticket, and stop after completion.

## Context

- User intent: a freshly cloned boilerplate should have an immediately usable
  private dashboard without old demo/prototyping content.
- Product behavior: `/dashboard` is the canonical Pilote home. There is no
  `/dashboard/pilote` route. Other dashboard sections use dedicated routes.
- User stories covered: authenticated user reaches a responsive dashboard;
  desktop users navigate via sidebar; mobile users navigate via bottom nav;
  future business modules can add typed routes and grouped nav entries.
- Technical decisions already made: follow the RLE pattern for dashboard layout;
  start with a flat visible nav (`Pilote`, `Administration`) but type the config
  for future `link` and `group` entries; hide actions that are not wired; no
  fake data; no project-pilot wording; email is not displayed in the header by
  default.
- Constraints and preferences: keep the header compact and useful, not
  cosmetic; show route title, user name if available, founder badge if useful,
  and logout; bottom nav contains sections only, not logout.
- Confirmed repository facts: current `/dashboard` renders old
  `DashboardHome`; current `/dashboard/crud` and `src/features/crud` implement a
  generic CRUD; current `LoginForm` pushes to `/dashboard`.
- Safe assumptions: dashboard components should live in `src/features/dashboard`
  because they are dashboard-specific, while shared UI primitives remain in
  `src/components/ui`.
- Open ambiguities and default resolution: if a route needs live data, use only
  `requireSession()` and existing services; do not create fake repositories.

## Scope

- `src/app/(authenticated)/dashboard/`
- `src/features/dashboard/`
- `src/features/crud/` and `/dashboard/crud` removal
- `src/lib/db/schema.ts` removal of CRUD schema exports
- `src/features/auth/components/LoginForm.tsx` only if redirect handling needs
  alignment
- Dashboard-related tests and proxy tests if route behavior changes
- Local `AGENT.md` files that describe the old CRUD/dashboard contract

## Out Of Scope

- Founder seed implementation.
- Email invitations or member creation flow.
- Public site or landing page.
- Business modules.
- Full design system.
- Changing Better Auth internals.
- Creating `/dashboard/pilote`.

## Required Reading

Read these before editing, in order:

1. `AGENT.md`
2. `CONTEXT.md`
3. `docs/adr/0001-dashboard-modules-use-typed-features.md`
4. `docs/adr/0002-founder-is-platform-authority.md`
5. `src/app/AGENT.md`
6. `src/app/(authenticated)/AGENT.md`
7. `src/app/(authenticated)/dashboard/AGENT.md`
8. `src/features/AGENT.md`
9. `src/features/dashboard/AGENT.md`
10. `src/components/AGENT.md`
11. `src/styles/AGENT.md`
12. `src/lib/auth/AGENT.md`
13. `tests/AGENT.md`
14. `tests/features/AGENT.md`
15. `tests/proxy.test.ts`
16. `src/app/(authenticated)/layout.tsx`
17. `src/app/(authenticated)/dashboard/page.tsx`
18. `src/app/(authenticated)/dashboard/crud/page.tsx`
19. `src/features/dashboard/config.ts`
20. `src/features/dashboard/components/DashboardHome.tsx`
21. `src/features/crud/`
22. `src/lib/db/schema.ts`
23. `src/features/auth/components/LoginForm.tsx`
24. `src/proxy.ts`
25. RLE reference if useful: `/home/necatech/Stockage/dev/presta/rle/src/app/(authenticated)/dashboard/layout.tsx` and `/home/necatech/Stockage/dev/presta/rle/src/features/vehicle-sales/components/dashboard-nav.tsx`

## Expected Changes

- Add `src/app/(authenticated)/dashboard/layout.tsx` as the dashboard shell
  layout, keeping `src/app/(authenticated)/layout.tsx` as auth-only protection.
- Replace `/dashboard/page.tsx` with the Pilote home view.
- Add `/dashboard/administration/page.tsx` as a real placeholder route with
  non-fictional empty states and hidden optional actions.
- Add typed dashboard navigation config supporting `link` and future `group`
  entries, initially rendering only flat visible links.
- Add dashboard components for shell/sidebar/bottom nav/header/Pilote/Admin
  surfaces as appropriate.
- Use `usePathname()` client-side only in navigation components for active link
  state.
- Keep Pilote content operational and generic: no fake numeric metrics, no
  “project pilot”, no demo/seed/to-branch copy, no client-specific content.
- Show compact route context, user name, founder badge if available, and logout;
  do not show email by default.
- Remove `src/features/crud`, `/dashboard/crud`, and CRUD schema exports.
- Update stale dashboard/CRUD local `AGENT.md` files when they contradict ADR 0001.
- Add or update tests for route/nav expectations where practical.

## Local Rules To Preserve

- Every protected dashboard route remains under `(authenticated)` and ultimately
  protected by `requireSession()`.
- `page.tsx` files are composition only and must not import repositories or DB.
- Components use Tailwind classes and semantic tokens only; no raw colors or
  inline styles.
- Use lucide icons for nav/buttons where icons are useful.
- Do not place UI cards inside other cards.
- Do not add visible in-app instructional text about implementation or future
  wiring.
- Navigation config should be typed and centralized.

## Forbidden Shortcuts

- Do not leave `/dashboard/crud` or `src/features/crud` in place.
- Do not keep old dashboard config copy about demo, seed, project pilot, or
  configurable CRUD.
- Do not create `/dashboard/pilote`.
- Do not show fake counts, fake revenue, fake activity, or fake members.
- Do not hardcode a founder by email or id for the header badge.
- Do not put logout in the mobile bottom nav.
- Do not weaken proxy/auth tests to pass.
- Do not perform destructive DB, deploy, push, merge, or environment overwrite actions.

## Dependencies

- Ticket 01 must be complete if the header uses `session.user.role` or founder
  helpers.

## Implementation Steps

1. Read Required Reading.
2. Confirm ticket 01 has been completed if platform role data is rendered.
3. Inspect current dashboard and CRUD references with `rg`.
4. Remove the old configurable dashboard/CRUD surfaces and schema exports.
5. Implement the dashboard shell, typed nav config, Pilote page, and
   Administration placeholder.
6. Align login/auth redirects if needed so post-login lands on `/dashboard`.
7. Add or update focused tests for route contract and active navigation where
   practical.
8. Run validation commands.
9. Create or update the report.
10. Update ticket and roadmap statuses.

## Acceptance Criteria

- [x] `/dashboard` is the Pilote home and renders inside the dashboard shell.
- [x] `/dashboard/administration` exists and renders a real empty-state
      placeholder without fake data.
- [x] There is no required `/dashboard/pilote` route.
- [x] Desktop navigation uses a sidebar.
- [x] Mobile navigation uses bottom nav for sections only.
- [x] Active nav state is visible.
- [x] Navigation is centralized and typed, ready for future groups.
- [x] Header is compact and useful, with route title, user name, founder badge
      when applicable, and logout.
- [x] Email is not displayed by default in the header.
- [x] The old CRUD route, feature, and schema export are removed.
- [x] No client-specific, project-pilot, demo, seed, or fake metric content
      remains in dashboard UI.
- [x] Build/type/lint/tests/readiness do not reference removed CRUD files.

## Validation Commands

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm readiness`
- `pnpm build`

If schema exports changed, also run `pnpm db:generate` and inspect generated
output without applying migrations to shared/staging/prod databases.

## Report Path

`docs/reports/03_native_dashboard_shell_and_legacy_crud_removal.report.md`

## Completion Checklist

- [x] Implementation is complete within Scope.
- [x] Acceptance criteria are checked.
- [x] Validation commands were run, or failures/blockers are documented with evidence.
- [x] Report exists at the Report Path.
- [x] Report includes files changed, implementation notes, validation results, risks, and handoff.
- [x] This ticket `## Status` is changed to `done` if complete.
- [x] `docs/tickets/00_roadmap.md` row for this ticket is changed to `[x] done`.
- [x] `docs/roadmap.md` still points to `docs/tickets/00_roadmap.md`.
- [x] Final response lists modified files, validation performed, remaining risks, and deviations from this ticket.

## Stop Conditions

Stop and ask before continuing if:

- Ticket 01 is needed but not complete.
- Removing CRUD reveals persisted migrations or applied DB state that require a
  deprecation strategy.
- Scope must expand into member creation, invitations, or business modules.
- A local `AGENT.md`, ADR, or repository rule conflicts with this ticket.
- A destructive DB, deployment, push, merge, or environment action appears necessary.
- `/goal 03` does not resolve to exactly one ticket.

## Handoff

After completion, stop. Do not start the next ticket. Report status and
remaining risks to the user.
