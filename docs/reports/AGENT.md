# Execution Reports (`docs/reports/`)

## Purpose

Post-ticket evidence and handoff records. Reports explain what changed, what was
validated, what failed, and what remains risky.

## Mutation Rules

- Create or update one report per executed ticket.
- Use the report path declared by the ticket.
- Reports may summarize implementation, but must not replace ticket status or
  roadmap status updates.
- Record failed or skipped validation honestly with evidence.

## Required Content

Each report should include:

- status: `done`, `partial`, or `blocked`
- summary
- files changed
- implementation notes
- validation results
- architecture compliance
- risks
- handoff

## Failure Conditions

Stop before marking a report `done` if acceptance criteria or required status
updates were not completed.

## Verification

- `find docs/reports -maxdepth 1 -type f | sort`
- Check that the matching ticket and roadmap row were updated.
