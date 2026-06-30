# Catalog Conventions

The catalog stores reusable assets outside the active application tree.

```text
src/     = active implementation
catalog/ = reusable invariants, business grafts, and compositions
```

## Entry Families

- `invariants/`: shared guarantees reusable across several business domains.
- `business/`: graftable business logic packages.
- `compositions/`: validated assemblies of invariants and business grafts.
- `conventions/`: formats and naming rules for the catalog itself.

## Grafting Rule

Catalog entries are integrated into `src/` during client development. Before
staging, the client project must keep only the selected active implementation in
`src/` and remove `catalog/`.

## Naming

- Catalog ids use lowercase kebab-case.
- Capability permissions use `<domain>.<resource>.<action>` when a resource is
  present, otherwise `<domain>.<action>`.
- Workflow statuses use stable business language, not UI copy.
- Role templates describe workspace roles, not platform roles.

## Business Graft Minimum Contract

A business graft should define:

- identity and maturity;
- required invariants;
- dependencies and conflicts;
- schemas and persistence notes;
- capabilities and role templates;
- navigation and route contributions;
- workflows, statuses, and transition permissions;
- source files or templates;
- tests or test templates;
- integration and specialization notes.

## Invariant Minimum Contract

An invariant should define:

- the guarantee it provides;
- where it applies;
- how a graft declares it;
- how it is verified;
- what must fail if the guarantee is violated.
