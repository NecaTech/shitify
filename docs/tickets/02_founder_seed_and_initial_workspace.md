# Ticket 02 - Founder seed and initial workspace

Ticket ID: 02

## Status

done

## Contract Summary

- Execute only ticket 02.
- Do not continue to ticket 03.
- Completion requires implementation, validation evidence, report update, and roadmap/status updates.

## Source Issue

Quick ticket - no source issue

## Preparation Mode

quick

## Type

script, schema, test

## Goal

Replace the old demo admin seed with the single official founder seed. The seed
must create or update a founder account and initial workspace idempotently
without hardcoded credentials or cleartext password logs.

## Execution Contract

This ticket is executed by launching `/goal 02` in a fresh session. The executor
must locate exactly one `docs/tickets/02_*` ticket, read it, read the required
references, implement only this ticket, and stop after completion.

## Context

- User intent: after standard setup, the technical owner can log into the
  private dashboard without asking an agent for credentials.
- Product behavior: the founder is a platform authority; the initial workspace
  represents the client organization but does not make the founder a workspace
  member.
- User stories covered: a maintainer can seed a founder account; seed can be
  rerun safely; password reset requires explicit intent.
- Technical decisions already made: no `FOUNDER_SEED_ENABLED`; running
  `pnpm db:seed` is the explicit intent. Required env values are
  `FOUNDER_EMAIL`, `FOUNDER_NAME`, and `FOUNDER_INITIAL_PASSWORD`. Password reset
  for an existing founder requires `FOUNDER_RESET_PASSWORD=true`.
- Constraints and preferences: remove all `admin@example.local` and
  `AdminPassword123!` defaults; do not create parallel seed mechanisms; do not
  show the password in logs.
- Confirmed repository facts: `scripts/seed.ts` currently creates a demo admin
  with hardcoded fallbacks; scripts may use explicit `process.env` and must use a
  dedicated DB connection instead of importing `@/lib/db`.
- Safe assumptions: the initial workspace can use generic env variables such as
  `INITIAL_WORKSPACE_NAME` and `INITIAL_WORKSPACE_SLUG` or conservative defaults
  derived from configured project metadata, but this must not introduce secrets.
- Open ambiguities and default resolution: if workspace slug defaults are unclear,
  prefer explicit non-sensitive env variables and document them in `.env.example`.

## Scope

- `scripts/seed.ts`
- `.env.example`
- script guard tests under `tests/scripts/`
- README seed/setup documentation where directly needed
- local `scripts/AGENT.md` wording if it still permits demo admin credentials

## Out Of Scope

- Dashboard UI.
- Member invitation emails.
- Resend integration.
- Creating client members, owners, or admins.
- Running seed against real DBs.
- Deployment, Vercel env mutation, or DB migration execution.

## Required Reading

Read these before editing, in order:

1. `AGENT.md`
2. `CONTEXT.md`
3. `docs/adr/0002-founder-is-platform-authority.md`
4. `scripts/AGENT.md`
5. `src/lib/db/AGENT.md`
6. `src/features/workspace/AGENT.md`
7. `tests/AGENT.md`
8. `tests/scripts/AGENT.md`
9. `.env.example`
10. `scripts/seed.ts`
11. `scripts/assert-safe-db-env.ts`
12. `src/lib/db/auth-schema.ts`
13. `src/features/workspace/schema.ts`
14. `package.json`
15. `README.md`
16. `docs/tickets/01_platform_roles_and_workspace_hierarchy.md`

## Expected Changes

- Replace demo admin env names and fallbacks with founder env validation.
- Require `DATABASE_URL`, `FOUNDER_EMAIL`, `FOUNDER_NAME`, and
  `FOUNDER_INITIAL_PASSWORD` when running the seed.
- Hash the password with the Better Auth-compatible mechanism already used by
  the repo.
- Create or update the founder user with platform role `founder`.
- Create or update a credential account for the founder.
- Do not change an existing founder credential password unless
  `FOUNDER_RESET_PASSWORD=true`.
- Create or update the initial workspace idempotently without adding the founder
  as a workspace member.
- Log only non-sensitive status such as founder email and workspace slug/name;
  never log the password or hash.
- Update `.env.example` with founder and initial workspace variables.
- Add tests proving required env validation, idempotent behavior expectations,
  no hardcoded password fallbacks, and reset flag semantics.

## Local Rules To Preserve

- Scripts must use `tsx`.
- Scripts must parse explicit env values; `.env.local` is loaded by the package
  script, not implicitly by arbitrary imports.
- Scripts can import Drizzle schemas but must not import `{ db }` from `@/lib/db`.
- Scripts must close DB connections explicitly.
- Do not modify schema or generate migrations from custom scripts.
- Never pass or print secrets in shell args or logs.

## Forbidden Shortcuts

- Do not keep `admin@example.local`, `AdminPassword123!`, `ADMIN_EMAIL`,
  `ADMIN_PASSWORD`, or `ADMIN_NAME` as the official seed path.
- Do not add `FOUNDER_SEED_ENABLED`.
- Do not hardcode founder email, password, ids, workspace ids, URLs, or DB values.
- Do not create the founder as a workspace member.
- Do not reset an existing founder password without `FOUNDER_RESET_PASSWORD=true`.
- Do not run seed, migrations, deploys, or environment mutation commands.

## Dependencies

- Ticket 01 must be complete because the seed writes the platform role and
  relies on the final workspace role schema.

## Implementation Steps

1. Read Required Reading.
2. Confirm ticket 01 has been completed and reported.
3. Inspect current seed and script tests.
4. Implement explicit founder env validation and idempotent upserts.
5. Add or update script tests using fictive env data.
6. Update `.env.example` and README seed instructions.
7. Run validation commands.
8. Create or update the report.
9. Update ticket and roadmap statuses.

## Acceptance Criteria

- [x] `pnpm db:seed` uses only the founder seed path.
- [x] No hardcoded password or demo admin account remains in the seed script.
- [x] `FOUNDER_EMAIL`, `FOUNDER_NAME`, and `FOUNDER_INITIAL_PASSWORD` are required
      for the seed.
- [x] `FOUNDER_RESET_PASSWORD=true` is required to rotate an existing founder
      credential password.
- [x] Founder password is hashed with the existing Better Auth-compatible
      mechanism.
- [x] Seed creates or updates the initial workspace without creating a founder
      workspace membership.
- [x] Seed logs do not include plaintext passwords or hashes.
- [x] `.env.example` documents the required founder and initial workspace env values.
- [x] Tests cover validation and reset semantics with fictive data.

## Validation Commands

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm readiness`

Do not run `pnpm db:seed` against a real/shared DB during this ticket unless the
user explicitly authorizes a safe local database.

## Report Path

`docs/reports/02_founder_seed_and_initial_workspace.report.md`

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

- Ticket 01 is not complete.
- Implementing idempotence requires destructive DB operations.
- The script would need to print or pass a secret outside env.
- Scope must expand into email invitations or member creation.
- A local `AGENT.md`, ADR, or repository rule conflicts with this ticket.
- `/goal 02` does not resolve to exactly one ticket.

## Handoff

After completion, stop. Do not start the next ticket. Report status and
remaining risks to the user.
