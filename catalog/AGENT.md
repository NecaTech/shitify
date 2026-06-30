# Catalog (`catalog/`)

## Purpose

Reusable workshop library for the boilerplate. This folder stores portable
invariants, business grafts, and validated compositions outside `src/`.

`catalog/` is not application runtime code. Active project code lives in `src/`.

## Vocabulary

- **Invariant**: reusable rule or guarantee shared by several business domains.
- **Business graft**: portable package for a reusable business logic.
- **Composition**: validated assembly of invariants and business grafts.
- **Active implementation**: code currently integrated in `src/`.

## Lifecycle

1. Prototype and prove behavior in `src/`.
2. Promote reusable behavior into `catalog/` with contracts and tests.
3. Graft selected catalog entries back into `src/` for a client project.
4. Before staging, delete `catalog/` from the client project and keep only the
   selected implementation in `src/`.

## Boundaries

- No staging or production code may import from `catalog/`.
- Catalog entries must be graftable into `src/` without hidden dependencies.
- Catalog files must not depend on project-specific client names, credentials,
  production URLs, or private business data.
- Use manifests and integration notes instead of implicit copy instructions.

## Safe Edit Surface

Agents may safely:

- add new invariant, business, composition, or convention folders;
- add `AGENT.md`, `README.md`, manifests, contracts, and integration notes;
- archive validated reusable behavior from `src/` when the source behavior is
  understood and covered by tests.

Agents must not:

- wire runtime imports from `src/` to `catalog/`;
- move unfinished client-specific code into the catalog as reusable behavior;
- remove source implementations from `src/` during promotion unless explicitly
  asked;
- treat `catalog/` as a backup dump without a manifest and graft contract.

## Verification

- Reread changed catalog contracts.
- Check paths with `rg --files catalog`.
- Documentation-only catalog changes do not require app build checks.
