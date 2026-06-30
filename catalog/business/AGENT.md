# Business Grafts (`catalog/business/`)

## Purpose

Portable business logic packages that can be grafted into `src/features/` during
client project development.

## Boundaries

- Active development starts in `src/features/<logic>/`.
- Promotion to `catalog/business/<logic>/` happens only after behavior is
  understood, tested, and reusable.
- A business graft must include its manifest and graft instructions.
- Business grafts may reference catalog invariants by id.
- Business grafts must not require `catalog/` at runtime after being integrated
  into `src/`.

## Required Shape

Each business graft should eventually contain:

- `manifest.*` describing identity, dependencies, permissions, role templates,
  routes, navigation, schemas, workflows, statuses, invariants, and maturity;
- `README.md` explaining the business intent;
- `integration.md` explaining how to graft into `src/`;
- `source/` containing portable implementation files or templates;
- `tests/` containing contract tests or test templates;
- `declinations/` when variants exist.

## Safe Edit Surface

Agents may archive validated logic from `src/features/<logic>/` into a graft.

Agents must not:

- catalog experimental code that has not been exercised in `src/`;
- hide project-specific assumptions inside a reusable graft;
- create cross-graft imports unless the dependency is declared in the manifest.

## Verification

- Check that all declared dependencies are explicit.
- Check that graft instructions identify target `src/` paths.
- Check that permissions are capability-based, not only navigation labels.
