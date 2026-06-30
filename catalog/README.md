# Catalog

Reusable library for invariants, business grafts, and validated compositions.

`src/` contains the active application implementation. `catalog/` contains
portable assets that can be grafted into a client project during development and
removed before staging.

## Structure

```text
catalog/
  invariants/    # reusable rules shared by several business domains
  business/      # graftable business logic packages
  compositions/  # validated assemblies of invariants and business grafts
  conventions/   # catalog formats, naming rules, and graft contracts
```

## Rule

No staging or production runtime code should import from `catalog/`. A selected
catalog entry must be integrated into `src/` before staging.
