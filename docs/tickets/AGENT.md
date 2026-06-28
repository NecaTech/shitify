# Execution Tickets (`docs/tickets/`)

## Purpose

Local execution contracts for future `/goal <id>` sessions. Tickets must be
precise enough to execute without conversation history.

## Authority

- `00_roadmap.md` is the ticket index and status board.
- `NN_slug.md` files are the executable contracts.
- Reports live in `docs/reports/` and must be linked from each ticket.

## Mutation Rules

- Preserve stable ticket IDs and filenames once created.
- One `/goal <id>` session executes exactly one matching ticket.
- Update ticket status, roadmap row, and report path after execution.
- Do not split or merge tickets unless the user approves a new mapping.
- Keep `Preparation Mode` truthful: `quick` when no PRD/issues exist.

## Required Ticket Properties

Each executable ticket must include:

- `Ticket ID`
- `## Status`
- execution contract
- scope and out-of-scope
- required reading
- acceptance criteria
- validation commands
- report path
- stop conditions

## Failure Conditions

Stop before editing if `/goal <id>` would match zero or multiple tickets, or if
ticket scope conflicts with ADRs or local `AGENT.md` rules.

## Verification

- `find docs/tickets -maxdepth 1 -type f | sort`
- `rg -n "^Ticket ID:|^## Status|^## Report Path" docs/tickets`
