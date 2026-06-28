# ADRs (`docs/adr/`)

## Purpose

Accepted architecture decisions that explain non-obvious trade-offs.

## Mutation Rules

- Add a new numbered ADR for a new accepted decision.
- Do not edit an accepted ADR to reverse or reinterpret it; create a later ADR.
- Small typo or broken-link fixes are allowed when they do not change meaning.
- Keep ADRs short and decision-focused.

## Current Decisions

- `0001`: dashboard modules use typed features; no generic CRUD as native dashboard foundation.
- `0002`: Founder is platform authority; workspace roles govern client permissions.

## Failure Conditions

Stop before editing if the requested change would contradict an accepted ADR
without a new explicit decision.

## Verification

- `find docs/adr -maxdepth 1 -type f | sort`
- Reread new or modified ADRs.
