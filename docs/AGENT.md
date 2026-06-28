# Documentation (`docs/`)

## Purpose

Documentation sources of truth for decisions, execution tickets, reports, and
roadmap pointers. Human explanation belongs in README files; agent routing and
mutation policy belongs in `AGENT.md`.

## Authority

- `docs/adr/` records accepted architecture decisions.
- `docs/tickets/` records executable `/goal <id>` contracts.
- `docs/reports/` records post-ticket execution evidence.
- `docs/roadmap.md` is an index, not the source of full ticket content.
- `docs/development-phases.md` records the dev/staging/production lifecycle for
  projects cloned from the boilerplate.
- `CONTEXT.md` is the glossary and must stay free of implementation detail.

## Read Order

Before editing docs, read:

1. `AGENT.md`
2. this file
3. `CONTEXT.md` when domain terms are involved
4. relevant `docs/<node>/AGENT.md`
5. relevant ADRs, tickets, or reports

## Safe Edit Surface

Agents may safely:

- add ADRs, tickets, and reports under their local contracts;
- update roadmap links and ticket/report statuses;
- correct stale documentation that contradicts accepted ADRs.

Agents must not:

- rewrite accepted ADR history to match implementation drift;
- duplicate full ADR or ticket content into indexes;
- mark a ticket executable when required decisions are missing;
- describe future Resend/invitation work as implemented behavior.

## Verification

- Reread affected docs after editing.
- Check links and paths with `rg` or `find`.
- For documentation-only changes, `pnpm readiness:static` is usually enough.
