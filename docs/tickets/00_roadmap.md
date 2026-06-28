# Ticket Roadmap

## Preparation Mode

quick

Reduced certainty: no PRD or issue breakdown was created. These tickets are
based on the completed grill session, `CONTEXT.md`, ADRs, and current repository
contracts.

## Sources

- PRD: none
- Issues: none
- Domain vocabulary: [CONTEXT.md](../CONTEXT.md)
- ADR: [0001 - Dashboard Modules Use Typed Features](../adr/0001-dashboard-modules-use-typed-features.md)
- ADR: [0002 - Founder Is Platform Authority](../adr/0002-founder-is-platform-authority.md)
- Repository rules: `AGENT.md` and child `AGENT.md` files listed in each ticket
- RLE reference consulted during planning: `/home/necatech/Stockage/dev/presta/rle`

## Tickets

| Status   | Ticket                                              | Source issue                   | Type                           | Dependencies | Path                                                           | Report                                                                           |
| -------- | --------------------------------------------------- | ------------------------------ | ------------------------------ | ------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [x] done | 01 - Platform roles and workspace hierarchy         | Quick ticket - no source issue | schema, service, test          | None         | [ticket](01_platform_roles_and_workspace_hierarchy.md)         | [report](../reports/01_platform_roles_and_workspace_hierarchy.report.md)         |
| [x] done | 02 - Founder seed and initial workspace             | Quick ticket - no source issue | script, schema, test           | 01           | [ticket](02_founder_seed_and_initial_workspace.md)             | [report](../reports/02_founder_seed_and_initial_workspace.report.md)             |
| [x] done | 03 - Native dashboard shell and legacy CRUD removal | Quick ticket - no source issue | ui, page, integration          | 01           | [ticket](03_native_dashboard_shell_and_legacy_crud_removal.md) | [report](../reports/03_native_dashboard_shell_and_legacy_crud_removal.report.md) |
| [x] done | 04 - Documentation and readiness alignment          | Quick ticket - no source issue | documentation, test, readiness | 01, 02, 03   | [ticket](04_documentation_and_readiness_alignment.md)          | [report](../reports/04_documentation_and_readiness_alignment.report.md)          |

## Validation Summary

- Schema/auth tickets should run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm readiness`, and Drizzle generation/check commands where applicable.
- Dashboard UI ticket should run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm readiness`, and preferably `pnpm build`.
- Documentation/readiness ticket should run `pnpm readiness:static` plus broader checks if code changes are required.

## Execution Notes

- Launch exactly one ticket in a future session with `/goal <ticket-id>`.
- Do not continue from one ticket to the next unless the user starts the next goal.
- Each executor must update this roadmap, its ticket status, and its report path.
