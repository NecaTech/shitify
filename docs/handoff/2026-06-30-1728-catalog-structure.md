# Handoff: Catalog Structure

Created: 2026-06-30 17:28 CEST
Project: `/home/necatech/Stockage/dev/necatech-boilerplate`
Next session focus: continue conventioning the reusable catalog and prepare the first invariant or business graft.

## Restart Prompt

Continue from `docs/handoff/2026-06-30-1728-catalog-structure.md` and define the first concrete catalog entry format or promote the first proven invariant/business logic into `catalog/`.

## User Goal

- Evolve the boilerplate into a workshop for developing, testing, maturing, and later grafting reusable business logic and shared invariants.
- Keep active development in `src/`, then archive proven reusable assets into `catalog/`.
- Make catalog entries graftable into client projects during development, with `catalog/` removed before staging.
- Stop treating stale ADRs, tickets, reports, and handoffs as authoritative because the user deleted them as polluted/obsolete context.

## Session Summary

- Re-diagnosed the architecture while ignoring deleted ADR/ticket/report/handoff artifacts.
- Agreed on the central split: `src/` is the active implementation, `catalog/` is a reusable library.
- Chose vocabulary: Catalog, Invariant, Business Graft, Composition, Active Implementation.
- Created the initial `catalog/` structure and local agent contracts.
- Updated root/docs/feature/auth agent routing to avoid stale references and to document the new catalog lifecycle.

## Actions Completed

- Created `catalog/` with subfolders for reusable invariants, business grafts, compositions, and conventions.
- Added `AGENT.md` contracts for each catalog node.
- Added human-facing README files for catalog nodes.
- Added `catalog/conventions/catalog-conventions.md` with minimum conventions for ids, capabilities, grafting, business grafts, and invariants.
- Updated `CONTEXT.md` with stable glossary entries for the new vocabulary.
- Updated `AGENT.md` to route catalog work and remove references to deleted ADR/ticket/report nodes.
- Updated `docs/AGENT.md` and `docs/roadmap.md` so stale planning artifacts are no longer authoritative.
- Updated `src/features/AGENT.md` to define the flow from active feature work to catalog promotion.
- Updated `src/lib/auth/AGENT.md` to reference `CONTEXT.md` instead of a deleted ADR.

## Files And Artifacts

- `catalog/AGENT.md`: global catalog mutation contract.
- `catalog/README.md`: human summary of catalog purpose and staging rule.
- `catalog/invariants/AGENT.md`: local contract for reusable invariant entries.
- `catalog/business/AGENT.md`: local contract for business graft entries.
- `catalog/compositions/AGENT.md`: local contract for reusable assemblies.
- `catalog/conventions/AGENT.md`: local contract for convention files.
- `catalog/conventions/catalog-conventions.md`: first convention document.
- `CONTEXT.md`: now defines Catalog, Invariant, Business Graft, Composition, Active Implementation.
- `AGENT.md`: now routes catalog work and warns against runtime staging/prod imports from catalog.
- `src/features/AGENT.md`: now states active business logic is developed in `src/features/<feature>/` before catalog promotion.
- `docs/roadmap.md`: now records the current architectural direction instead of pointing to deleted tickets.

## Durable References

- `catalog/AGENT.md`: read before any catalog mutation.
- `catalog/conventions/catalog-conventions.md`: current source for catalog naming and minimum contracts.
- `CONTEXT.md`: stable vocabulary for future agents.
- `AGENT.md`: root routing and global architecture rules.
- `src/features/AGENT.md`: required when promoting active feature logic into a business graft.
- `docs/development-phases.md`: still defines dev/staging/prod for client projects.

## Commands And Results

- `date '+%Y-%m-%d %H:%M %Z'`: returned `2026-06-30 17:28 CEST`.
- `git status --short`: showed current session edits plus user-deleted stale docs under `docs/adr`, `docs/tickets`, `docs/reports`, and several `docs/handoff` files.
- `rg --files catalog docs | sort`: confirmed new catalog files and remaining docs.
- `pnpm readiness:static`: passed with status `PILOT_READY_WITH_WARNINGS`; warnings were email verification, CSP unsafe-inline, CSP connect-src, and TODO(init-project) markers.

## Decisions And Constraints

- `catalog/` is not runtime application code.
- No staging or production runtime may import from `catalog/`.
- Active implementation lives in `src/`; reusable assets are promoted into `catalog/` only once proven.
- A client project can use `src/ + catalog/` during development, but must remove `catalog/` before staging.
- A Business Graft must be more than a copied folder: it needs manifest, invariants, schemas, capabilities, role templates, navigation, routes, workflows, statuses, tests, and integration notes.
- Invariants can be independent reusable guarantees shared by several business grafts.
- Deleted ADRs/tickets/reports/handoffs should not be treated as authoritative.

## Current State

- The catalog skeleton and documentation are in place.
- No concrete invariant or business graft has been created yet.
- Existing `booking`, `commerce`, `contact`, `notifications`, and `uploads` remain active `src/features` schema-only seeds, not catalog grafts.
- Worktree is dirty with both current-session changes and user-deleted obsolete docs.

## Planned Next Actions

1. Decide the first concrete catalog entry to model: likely a shared invariant such as platform role separation, workspace scoping, or authorized workflow transitions.
2. Define a concrete manifest shape for invariants and business grafts, preferably with a TypeScript schema or strongly typed convention.
3. Promote one small proven behavior into `catalog/invariants/` to test the convention.
4. Later, use `contact` as the first simple Business Graft candidate once it has more than a schema.
5. Add static checks preventing runtime imports from `catalog/` if this rule becomes important enough to automate.

## Open Questions And Risks

- Exact manifest file format is not settled yet: `.ts`, `.json`, or generated TypeScript schema.
- The word "Business Graft" is now documented, but the user may still prefer a French term later.
- There is still one older handoff file under `docs/handoff/`; it references stale ADR/ticket artifacts and should not be treated as authority unless explicitly revived.
- No automation currently enforces "no runtime import from catalog".

## Suggested Skills

- `agents-dispatch`: use when changing `AGENT.md` routing or adding local catalog contracts.
- `improve-codebase-architecture`: use when deciding the manifest seam and how catalog entries graft into `src/`.
- `grill-with-docs`: use if vocabulary or lifecycle decisions need to be challenged and recorded in `CONTEXT.md`.
- `ticket-maker`: use only after the catalog convention is stable enough to create execution-ready local tickets.

## Verification

- Done: `pnpm readiness:static` passed with warnings and no failures.
- Done: path/reference scans with `rg` confirmed active agent contracts no longer depend on deleted ADR/ticket/report files.
- Needed: no full `pnpm test`, `pnpm typecheck`, or `pnpm build` was run because this session made documentation and agent-contract changes only.
