# Documentation (`docs/`)

## Purpose

Documentation sources of truth for lifecycle, conventions, and roadmap
pointers. Human explanation belongs in README files; agent routing and mutation
policy belongs in `AGENT.md`.

## Authority

- `docs/roadmap.md` is an index, not the source of full ticket content.
- `docs/development-phases.md` records the dev/staging/production lifecycle for
  projects cloned from the boilerplate.
- `CONTEXT.md` is the glossary and must stay free of implementation detail.
- `catalog/conventions/` records reusable catalog formats and grafting rules.

## Read Order

Before editing docs, read:

1. `AGENT.md`
2. this file
3. `CONTEXT.md` when domain terms are involved
4. relevant `docs/<node>/AGENT.md` when that node exists
5. relevant convention or lifecycle documents

## Safe Edit Surface

Agents may safely:

- update lifecycle and convention documentation;
- update roadmap links;
- correct stale documentation that contradicts the current code or glossary.

Agents must not:

- reference deleted ADR, ticket, report, or handoff files as authoritative;
- duplicate catalog conventions instead of linking the catalog convention file;
- describe future Resend/invitation work as implemented behavior.

## Verification

- Reread affected docs after editing.
- Check links and paths with `rg` or `find`.
- For documentation-only changes, `pnpm readiness:static` is usually enough.
