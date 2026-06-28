# Handoff: Public Site Generic

Created: 2026-06-27 11:12 CEST
Project: `/home/necatech/Stockage/dev/necatech-boilerplate`
Next session focus: prepare the same kind of grill/planning session for the public frontend site that was just completed for the dashboard.

## Restart Prompt

Continue from `docs/handoff/2026-06-27-1112-public-site-generic.md` and run a `grill-with-docs` style clarification session for the generic public website. The goal is to remove obsolete boilerplate/public-site occurrences and design a reusable public site structure that will be ready to display content managed from the dashboard.

## User Goal

- Later, the user wants to run the same discussion for the public frontend website that was run for the dashboard.
- The intended direction is to delete obsolete existing occurrences and create a generic public website foundation.
- The public site should be ready to display all content that will eventually be managed from the dashboard.
- Do not implement this immediately; the next session should first clarify and document decisions.

## Session Summary

- A detailed `grill-with-docs` session resolved the native dashboard and founder seed direction for `necatech-boilerplate`.
- The dashboard brief was refined away from `/dashboard/pilote`; `/dashboard` is the canonical Pilote home.
- The old configurable CRUD/dashboard direction was rejected in favor of typed feature modules, following the RLE pattern.
- Founder was defined as platform authority, separate from workspace roles.
- Quick executable tickets were created for the dashboard/founder implementation.
- Agent dispatch contracts were updated so future agents follow the new dashboard/founder decisions.
- The new public-site request is intentionally a future planning/grill session, not an implementation request in this turn.

## Actions Completed

- Created `CONTEXT.md` with domain vocabulary: Founder, Application Role, User, Workspace Role, Initial Workspace, Pilote, Member Invitation, and the Pilote vs pilot-project ambiguity.
- Created ADRs:
  - `docs/adr/0001-dashboard-modules-use-typed-features.md`
  - `docs/adr/0002-founder-is-platform-authority.md`
- Created quick execution tickets:
  - `docs/tickets/01_platform_roles_and_workspace_hierarchy.md`
  - `docs/tickets/02_founder_seed_and_initial_workspace.md`
  - `docs/tickets/03_native_dashboard_shell_and_legacy_crud_removal.md`
  - `docs/tickets/04_documentation_and_readiness_alignment.md`
- Created/updated agent contracts under `docs/`, dashboard, auth, workspace, scripts, DB, and CRUD legacy nodes.
- Inspected RLE at `/home/necatech/Stockage/dev/presta/rle` for dashboard layout/navigation precedent.

## Files And Artifacts

- `CONTEXT.md`: glossary and domain vocabulary. Read before introducing public-site terms.
- `docs/adr/0001-dashboard-modules-use-typed-features.md`: explains why generic CRUD is no longer the native dashboard foundation.
- `docs/adr/0002-founder-is-platform-authority.md`: explains global Founder vs workspace roles.
- `docs/tickets/00_roadmap.md`: quick ticket roadmap for dashboard/founder work.
- `docs/AGENT.md`, `docs/adr/AGENT.md`, `docs/tickets/AGENT.md`, `docs/reports/AGENT.md`: documentation mutation contracts.
- `src/app/page.tsx`: current public home is still a post-clone setup guide and contains stale CRUD wording.
- `src/app/AGENT.md`: App Router constraints for any public route work.
- `src/components/layout/AGENT.md`: layout component rules for future public shell/header/footer.
- `src/features/contact/AGENT.md`: relevant if the public site includes a contact form.
- `README.md`: still contains stale dashboard/configurable CRUD wording and is already earmarked for ticket 04 after dashboard implementation.

## Durable References

- `AGENT.md`: root routing and global architecture rules. It now states `/dashboard` is Pilote and modules should use typed features.
- `docs/AGENT.md`: source-of-truth and mutation rules for documentation nodes.
- `docs/adr/0001-dashboard-modules-use-typed-features.md`: future public-site content management should not default to a dynamic CRUD shortcut without a new decision.
- `docs/tickets/03_native_dashboard_shell_and_legacy_crud_removal.md`: dashboard implementation ticket; public site should not conflict with its dashboard assumptions.
- `docs/tickets/04_documentation_and_readiness_alignment.md`: README and stale public setup copy may be updated there after dashboard tickets.
- `src/app/page.tsx`: likely primary file to replace later with generic public site home.

## Commands And Results

- `find docs -maxdepth 3 -type f | sort`: showed ADRs, tickets, roadmap, and documentation AGENT files.
- `sed -n ... AGENT.md`, `docs/AGENT.md`, `src/app/AGENT.md`, `src/components/layout/AGENT.md`, `src/features/contact/AGENT.md`: read relevant routing and edit contracts.
- `sed -n ... src/app/page.tsx`: confirmed current public home is a setup guide and includes stale CRUD wording.
- `git status --short`: worktree is dirty with many existing changes, including docs/tickets/ADR/AGENT work from this session and unrelated prior modifications.

## Decisions And Constraints

- Next public-site session should start with `grill-with-docs`, not implementation.
- Preserve the dashboard decisions already made; do not reopen `/dashboard/pilote` or generic CRUD unless explicitly requested.
- Public site should be generic, reusable, and not client-specific.
- Public site should be ready to display content eventually managed from the dashboard, but content-management implementation may need separate decisions.
- Avoid fake public content that pretends to be real client data.
- Do not introduce Waffle Paradise, RLE, BBS Studio, or other client-specific content into the boilerplate.
- Use existing Next.js App Router, Tailwind, feature boundaries, and local AGENT contracts.
- If future public content is managed via dashboard, prefer typed features and explicit schemas/services/actions over generic dynamic CRUD, per ADR 0001.

## Current State

- No public-site planning artifacts or tickets have been created yet.
- Current public home remains the setup guide in `src/app/page.tsx`.
- Dashboard/founder planning artifacts exist but implementation tickets have not been executed.
- `README.md` and `src/app/page.tsx` still contain stale CRUD/setup wording.
- Worktree has uncommitted changes from this session and pre-existing unrelated changes; do not assume a clean tree.

## Planned Next Actions

1. In the future session, invoke `grill-with-docs`.
2. Read `CONTEXT.md`, relevant ADRs, `AGENT.md`, `src/app/AGENT.md`, `src/components/layout/AGENT.md`, and current `src/app/page.tsx`.
3. Clarify vocabulary: what “site public générique” means, what content categories exist, and which content is managed from dashboard vs static boilerplate.
4. Decide public route structure and whether `/` remains home only or includes additional generic routes.
5. Decide generic public shell: header, footer, navigation, CTAs, contact area, content placeholders, and empty/non-fictional states.
6. Decide whether the public-site plan needs a new ADR, tickets, and/or AGENT updates.
7. Only after decisions are resolved, create quick tickets with `ticket-maker` or implement if the user explicitly asks.

## Open Questions And Risks

- Which generic public sections are required by default: home, services/offers, content/news, contact, legal links, customer portal CTA, or others?
- Should public-site content be backed by existing features (`contact`, future dashboard config, marketing feature) or remain static until dashboard management exists?
- Should the public site include a generic contact form now, or only prepare the structure?
- How should the public site relate to future dashboard-managed content without implementing CMS/invitations too early?
- Risk: dashboard implementation tickets are not executed yet; public-site planning should not depend on code that does not exist.
- Risk: README/setup guide is still the public home and may be removed later; preserve setup instructions somewhere if the public site replaces it.

## Suggested Skills

- `grill-with-docs`: use first to challenge and document the public-site plan against existing vocabulary and ADRs.
- `agents-dispatch`: use if new public-site docs/features/routes need local AGENT rules or existing rules become stale.
- `ticket-maker`: use after public-site decisions are resolved to create quick executable tickets.
- `html`: only use if the user asks for a standalone public-site prototype outside the Next app.

## Verification

- Done: read root/docs/app/layout/contact contracts, current public home, existing ADR/ticket inventory, and worktree status.
- Needed: no build/test/readiness run for this handoff. Future planning should reread affected files and run validation only when implementation or docs contracts change.
