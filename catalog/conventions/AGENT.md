# Catalog Conventions (`catalog/conventions/`)

## Purpose

Formats and naming rules used by catalog entries: manifests, permission naming,
workflow naming, integration contracts, and specialization rules.

## Authority

- Convention files define how future catalog entries should be shaped.
- Local `AGENT.md` files under `catalog/` define mutation policy.
- `CONTEXT.md` remains the domain glossary for stable project vocabulary.

## Safe Edit Surface

Agents may update conventions when new catalog work reveals a repeated rule.

Agents must not retroactively rename established catalog ids without a migration
note for affected grafts and compositions.

## Verification

- Reread changed convention files.
- Check examples use existing vocabulary or add missing terms to `CONTEXT.md`.
