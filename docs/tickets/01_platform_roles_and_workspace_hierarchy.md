# Ticket 01 - Platform roles and workspace hierarchy

Ticket ID: 01

## Status

done

## Contract Summary

- Execute only ticket 01.
- Do not continue to ticket 02.
- Completion requires implementation, validation evidence, report update, and roadmap/status updates.

## Source Issue

Quick ticket - no source issue

## Preparation Mode

quick

## Type

schema, service, test

## Goal

Introduce the minimal platform role model and the expanded workspace role
hierarchy agreed during planning. Preserve the boundary where `founder` is a
global platform authority and client roles live only in workspace memberships.

## Execution Contract

This ticket is executed by launching `/goal 01` in a fresh session. The executor
must locate exactly one `docs/tickets/01_*` ticket, read it, read the required
references, implement only this ticket, and stop after completion.

## Context

- User intent: prepare the boilerplate with a native founder authority and clean
  client workspace role hierarchy.
- Product behavior: a `founder` can recover and maintain the application without
  being a member of every workspace.
- User stories covered: maintainers can distinguish platform authority from
  client permissions; future member management cannot accidentally administer
  platform roles.
- Technical decisions already made: `user.role` is minimal (`founder | user`);
  workspace roles are `owner`, `admin`, `manager`, `staff`, `editor`, `viewer`;
  platform roles are not administrable from client workspace UI.
- Constraints and preferences: do not introduce a full RBAC engine; do not create
  global `admin/manager/staff/editor/viewer` roles; keep helpers small.
- Confirmed repository facts: current `workspace_membership.role` only has
  `owner | admin | member`; Better Auth tables are in `src/lib/db/auth-schema.ts`;
  local DB migrations are generated per cloned project, not committed as a
  baseline.
- Safe assumptions: adding a default `user` role should not require users to be
  manually migrated in the boilerplate baseline because each client generates its
  own baseline after init.
- Open ambiguities and default resolution: if Better Auth schema generation
  cannot safely preserve custom user fields, stop and ask before hand-editing
  generated auth schema files.

## Scope

- Auth/user role model and safe helpers.
- Workspace role enum expansion and role ordering helpers.
- Focused tests for platform/workspace role guards.
- Local documentation/rules files only when they contradict this ticket.

## Out Of Scope

- Founder seed script changes.
- Dashboard UI.
- Member invitation flow.
- Email provider integration.
- Full permission matrix or RBAC engine.
- Destructive DB commands or manual SQL migrations.

## Required Reading

Read these before editing, in order:

1. `AGENT.md`
2. `CONTEXT.md`
3. `docs/adr/0002-founder-is-platform-authority.md`
4. `src/lib/AGENT.md`
5. `src/lib/auth/AGENT.md`
6. `src/lib/db/AGENT.md`
7. `src/features/AGENT.md`
8. `src/features/workspace/AGENT.md`
9. `tests/AGENT.md`
10. `tests/features/AGENT.md`
11. `src/lib/db/auth-schema.ts`
12. `src/lib/db/auth-schema.generated.ts`
13. `src/lib/auth/index.ts`
14. `src/lib/auth/server.ts`
15. `src/features/workspace/schema.ts`
16. `src/lib/db/schema.ts`
17. `package.json`

## Expected Changes

- Add a platform role enum or equivalent typed field to the active user schema
  with values `founder` and `user`, defaulting to `user`.
- Extend `workspace_membership.role` to `owner`, `admin`, `manager`, `staff`,
  `editor`, and `viewer`.
- Add small typed helpers for role checks/order, such as `isFounder`,
  `canManagePlatformRole`, and workspace role rank checks, in the appropriate
  auth/workspace layer.
- Update `src/lib/auth/AGENT.md`, `src/features/workspace/AGENT.md`, or related
  local rules if they still say roles are entirely project-specific or mention
  global admin patterns that now conflict with ADR 0002.
- Add or update focused unit tests under `tests/features/` for founder bypass
  and workspace hierarchy boundaries.

## Local Rules To Preserve

- `src/lib/db/auth-schema.generated.ts` and `src/lib/db/auth-schema.ts` are
  generated/controlled Better Auth schema files; do not hand-edit them unless
  the repository workflow explicitly requires it and the reason is documented.
- Feature schemas live under `src/features/<feature>/schema.ts` and are exported
  from `src/lib/db/schema.ts` when required.
- `service.ts` and server infra modules import `server-only`.
- Pages and React components must not import repositories or DB.
- Migrations are generated with Drizzle Kit; do not write SQL manually.
- The boilerplate keeps `src/lib/db/migrations/` empty outside `.gitkeep`.

## Forbidden Shortcuts

- Do not bypass local `AGENT.md` rules.
- Do not hardcode secrets, URLs, IDs, roles, permissions, DB values, or API results.
- Do not create global `admin`, `manager`, `staff`, `editor`, or `viewer` user roles.
- Do not infer founder from email, user id, or domain.
- Do not weaken tests or checks to pass validation.
- Do not modify unrelated features.
- Do not perform destructive DB, deploy, push, merge, or environment overwrite actions.

## Dependencies

None.

## Implementation Steps

1. Read Required Reading.
2. Inspect Better Auth support for custom user fields in the current version
   before editing schema files.
3. Implement the smallest durable platform role and workspace role hierarchy.
4. Add guard/helper tests that prove workspace roles cannot manage platform roles.
5. Update stale local rules that contradict the new model.
6. Run validation commands.
7. Create or update the report.
8. Update ticket and roadmap statuses.

## Acceptance Criteria

- [x] The active user model supports `founder` and default `user` platform roles.
- [x] Workspace membership roles include `owner`, `admin`, `manager`, `staff`,
      `editor`, and `viewer`.
- [x] Helpers/guards represent the rule that workspace roles never administer
      platform roles.
- [x] No founder behavior is inferred from email, user id, or workspace membership.
- [x] Tests cover the founder/platform role boundary and workspace hierarchy.
- [x] Local docs/rules no longer recommend a global client admin role.

## Validation Commands

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm readiness`
- If schema output changes: `pnpm auth:generate`, `pnpm db:generate`, review generated output, then `pnpm db:check`

Do not run `pnpm db:migrate` against a shared, staging, or production database.

## Report Path

`docs/reports/01_platform_roles_and_workspace_hierarchy.report.md`

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

- Better Auth schema generation conflicts with adding `user.role`.
- Scope must expand into invitations, email, or dashboard UI.
- Out of scope would be touched.
- A business rule is undefined.
- A local `AGENT.md`, ADR, or repository rule conflicts with this ticket.
- A destructive DB, deployment, push, merge, or environment action appears necessary.
- `/goal 01` does not resolve to exactly one ticket.

## Handoff

After completion, stop. Do not start the next ticket. Report status and
remaining risks to the user.
