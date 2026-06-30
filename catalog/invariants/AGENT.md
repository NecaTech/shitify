# Catalog Invariants (`catalog/invariants/`)

## Purpose

Reusable guarantees that can apply across several business grafts. Invariants
describe rules such as authorization, ownership, workflow transitions, audit,
file visibility, workspace scope, or lifecycle safety.

## Boundaries

- An invariant is not a full business logic.
- An invariant must be domain-neutral enough to be reused by multiple grafts.
- If a rule only makes sense for one business graft, keep it inside that graft.
- Invariants may define contracts, examples, tests, and adapters, but must not
  import application runtime code from `src/`.

## Required Shape

Each invariant folder should eventually contain:

- `README.md` for human explanation;
- a manifest describing the guarantee and applicability;
- tests or test templates proving the guarantee;
- integration notes naming the target seams in `src/`.

## Safe Edit Surface

Agents may add new invariant folders and document their contracts.

Agents must not promote a vague principle as an invariant without explicit
guarantees and at least one intended verification path.

## Verification

- Reread invariant manifests and integration notes.
- Confirm the invariant does not encode client-specific data.
