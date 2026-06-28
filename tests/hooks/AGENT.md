# Hook Tests (`tests/hooks/`)

## Purpose

Behavior tests for reusable client hooks under `src/hooks/`.

## Safe Edit Surface

Agents may safely:

- add tests for domain-agnostic hook behavior;
- use Testing Library hook helpers and fictive browser fixtures;
- verify observable hook state and callback effects.

Agents must not:

- encode client-specific feature names, routes, statuses, or payloads;
- use real network, storage provider, or browser permission APIs without fakes;
- test private implementation details instead of the hook contract.

## Machine-Enforced Rules

- `pnpm test` runs hook tests with Vitest.
- `vitest.config.mts` uses `jsdom` by default, so browser primitives can be faked locally.

## Verification

```bash
pnpm test tests/hooks
pnpm typecheck
```
