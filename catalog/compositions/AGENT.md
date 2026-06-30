# Catalog Compositions (`catalog/compositions/`)

## Purpose

Validated assemblies of catalog invariants and business grafts. A composition
captures a reusable project shape, not a deployed client project.

## Boundaries

- Compositions reference catalog entries; they do not duplicate full grafts.
- Compositions must list selected grafts, selected declinations, required
  invariants, role templates, and known conflicts.
- A composition is a development aid. It must be materialized into `src/` before
  staging.

## Safe Edit Surface

Agents may add composition folders once the referenced catalog entries exist.

Agents must not create a composition that depends on missing or undocumented
catalog entries.

## Verification

- Check referenced catalog paths exist.
- Check selected grafts do not declare unresolved conflicts.
