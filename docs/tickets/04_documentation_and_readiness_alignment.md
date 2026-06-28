# Ticket 04 - Documentation and readiness alignment

Ticket ID: 04

## Status

done

## Contract Summary

- Execute only ticket 04.
- Do not continue to any other ticket.
- Completion requires implementation, validation evidence, report update, and roadmap/status updates.

## Source Issue

Quick ticket - no source issue

## Preparation Mode

quick

## Type

documentation, test, readiness

## Goal

Align the repository documentation, local agent instructions, and readiness
checks with the new native dashboard and founder seed behavior after tickets 01
through 03 are complete.

## Execution Contract

This ticket is executed by launching `/goal 04` in a fresh session. The executor
must locate exactly one `docs/tickets/04_*` ticket, read it, read the required
references, implement only this ticket, and stop after completion.

## Context

- User intent: make the boilerplate coherent for future agents and developers
  after replacing the old dashboard/CRUD model.
- Product behavior: setup documentation should guide a cloned project through
  install, init, env, DB baseline, founder seed, and dashboard access.
- User stories covered: a developer cloning the boilerplate understands how to
  seed the founder; a future agent does not reintroduce CRUD or project-pilot UI;
  readiness/static checks reflect the new architecture.
- Technical decisions already made: no configurable CRUD in native dashboard;
  `/dashboard` is Pilote; founder seed is the single official seed; member
  invitations via trusted email links are a future direction but not implemented.
- Constraints and preferences: do not over-document implementation details in
  `CONTEXT.md`; keep README operational; keep AGENT rules aligned with current
  architecture.
- Confirmed repository facts: README currently documents configurable dashboard
  and CRUD; some local `AGENT.md` files currently mention project-pilot/CRUD
  patterns; readiness may contain checks that assume CRUD or old dashboard
  contracts.
- Safe assumptions: documentation-only changes can validate with
  `pnpm readiness:static`, but this ticket likely follows code changes and should
  run broader checks if readiness/test files are modified.
- Open ambiguities and default resolution: if implementation in tickets 01-03
  deviated from the plan, document the implemented behavior rather than the
  original plan.

## Scope

- `README.md`
- Relevant `AGENT.md` files whose rules are stale
- `scripts/readiness.ts` only if checks/warnings reference removed dashboard or
  CRUD behavior
- Tests under `tests/quality/`, `tests/scripts/`, or `tests/proxy.test.ts` only
  if documentation/readiness contracts require updates
- `docs/tickets/` and `docs/reports/` status/report updates

## Out Of Scope

- Implementing founder seed or dashboard if prior tickets are incomplete.
- Adding member invitation functionality.
- Creating a PRD or GitHub issues.
- Changing ADR decisions unless a real contradiction is found and approved.
- Running deploys, migrations against shared DBs, or environment mutations.

## Required Reading

Read these before editing, in order:

1. `AGENT.md`
2. `CONTEXT.md`
3. `docs/adr/0001-dashboard-modules-use-typed-features.md`
4. `docs/adr/0002-founder-is-platform-authority.md`
5. `docs/tickets/00_roadmap.md`
6. `docs/tickets/01_platform_roles_and_workspace_hierarchy.md`
7. `docs/tickets/02_founder_seed_and_initial_workspace.md`
8. `docs/tickets/03_native_dashboard_shell_and_legacy_crud_removal.md`
9. Reports for tickets 01-03, if present
10. `README.md`
11. `src/app/AGENT.md`
12. `src/app/(authenticated)/AGENT.md`
13. `src/app/(authenticated)/dashboard/AGENT.md`
14. `src/features/AGENT.md`
15. `src/features/dashboard/AGENT.md`
16. `src/features/workspace/AGENT.md`
17. `scripts/AGENT.md`
18. `src/lib/auth/AGENT.md`
19. `src/lib/db/AGENT.md`
20. `scripts/readiness.ts`
21. `package.json`

## Expected Changes

- Update README setup flow to include founder seed env variables and `pnpm db:seed`.
- Remove README sections that promote the old configurable dashboard and CRUD
  prototype as native boilerplate behavior.
- Document that `/dashboard` is Pilote and `/dashboard/administration` is the
  initial placeholder.
- Document that future business modules use typed features and dashboard nav
  config, not dynamic CRUD.
- Document founder/platform role boundary and workspace role hierarchy at the
  operational level without turning README into an RBAC manual.
- Update local `AGENT.md` files so future agents do not reintroduce stale
  project-pilot or CRUD assumptions.
- Update readiness/static checks if they look for removed files or outdated
  warnings.
- Add or adjust tests if readiness or route contracts changed.

## Local Rules To Preserve

- `CONTEXT.md` is glossary only; do not turn it into a spec.
- ADRs should not be rewritten unless the accepted decision itself changes.
- README should stay practical for clone/setup/run workflows.
- Do not copy client-specific RLE content into the boilerplate.
- Do not weaken readiness/test checks to hide regressions.

## Forbidden Shortcuts

- Do not document features that are not implemented as if they were available.
- Do not keep old CRUD/dashboard instructions as parallel official paths.
- Do not add fake credentials or hardcoded founder values to docs.
- Do not say invitations/Resend are implemented if they are only a future
  direction.
- Do not perform destructive DB, deploy, push, merge, or environment overwrite actions.

## Dependencies

- Ticket 01 complete.
- Ticket 02 complete.
- Ticket 03 complete.

## Implementation Steps

1. Read Required Reading.
2. Confirm tickets 01-03 are complete and inspect their reports.
3. Search for stale terms: `crud`, `projet pilote`, `project pilot`,
   `admin@example.local`, `AdminPassword123`, `/dashboard/pilote`,
   `/dashboard/crud`.
4. Update README and local AGENT/readiness files to match implemented behavior.
5. Add or adjust focused tests only where checks or contracts changed.
6. Run validation commands.
7. Create or update the report.
8. Update ticket and roadmap statuses.

## Acceptance Criteria

- [x] README accurately describes setup through founder seed and dashboard access.
- [x] README no longer presents configurable CRUD as a native dashboard feature.
- [x] Local AGENT rules no longer contradict ADR 0001 or ADR 0002.
- [x] Stale project-pilot wording is absent from boilerplate dashboard/docs
      surfaces where it would confuse Pilote with a project status.
- [x] Readiness/static checks do not expect removed CRUD files or old dashboard
      contracts.
- [x] Future invitation/Resend direction is documented only as future-ready, not
      implemented behavior.
- [x] Validation evidence is captured in the report.

## Validation Commands

- `pnpm readiness:static`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm readiness`

Run `pnpm build` if code or route files are changed during this ticket.

## Report Path

`docs/reports/04_documentation_and_readiness_alignment.report.md`

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

- Any dependency ticket is incomplete.
- Documentation would need to contradict implemented behavior.
- A local `AGENT.md`, ADR, or repository rule conflicts with this ticket.
- A destructive DB, deployment, push, merge, or environment action appears necessary.
- `/goal 04` does not resolve to exactly one ticket.

## Handoff

After completion, stop. Do not start another ticket. Report status and
remaining risks to the user.
