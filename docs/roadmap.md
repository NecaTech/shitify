# Roadmap

No executable ticket index is authoritative at the moment.

Current architectural direction:

- `src/` holds the active application implementation.
- `catalog/` holds reusable invariants, business grafts, and compositions.
- business logic is developed and proven in `src/`, then promoted into
  `catalog/` only when it is reusable and graftable.
- a client project removes `catalog/` before staging and keeps only selected
  active implementations in `src/`.
