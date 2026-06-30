# Handoff: Admin Dashboard Cleanup

Created: 2026-06-29 21:27 CEST
Project: `/home/necatech/Stockage/dev/necatech-boilerplate`
Next session focus: read this file only as context, then stand by for the user's next explicit instruction.

## Restart Prompt

Continue from `docs/handoff/2026-06-29-2127-admin-dashboard-cleanup.md`. This is only a context handoff: after reading it, do not implement, diagnose, browse, run checks, or inspect more files unless the user explicitly asks. Stand ready and wait for the next instruction.

## User Goal

- Founder remains platform authority, not a workspace member.
- Founder can create/configure/delete admins, workspaces, and custom workspace roles.
- Founder must not assign roles to members; role assignment belongs to admin member management.
- Admin profile is separate from founder:
  - Admin Pilote is business/workspace oriented.
  - Admin Administration must only manage users/members: create, edit, delete, and assign existing founder-created roles.
- UI must be sober and action-focused.
- Do not show explanatory denial copy, permission lectures, or "you cannot access X" messaging. Users should only see what they are allowed to act on.
- User explicitly objected to decorative/marketing-like cards and labels in Administration and role Pilote views.

## Session Summary

- The session started by reading `docs/handoff/2026-06-29-1731-admin-member-flow.md`, but the agent then over-acted and made auth/runtime changes without being asked. The user corrected course.
- The active work then focused on cleaning founder/admin dashboard surfaces:
  - Admin Administration should not show founder structural controls.
  - Role perspectives without administration access should render nothing extra and no denial text.
  - Administration pages should have only an H1 title, no hero card, no icon, no "Perspective ..." label.
  - Founder Administration should not show "Assigner un rôle"; admins assign existing roles while managing members.
- The worktree was already dirty before this handoff and remains dirty.

## Actions Completed

- Updated Administration routing so the active dashboard perspective determines the surface:
  - Founder perspective gets founder structural management.
  - Admin perspective gets member/user management only.
  - Role perspectives without administration permission render no Administration content.
- Removed useless role Pilote cards:
  - Removed "Vue <role>" block for custom roles.
  - Removed "Le founder conserve son identité..." copy.
  - Removed "Membres et droits" / "Ce rôle ne voit pas..." denial UI.
- Simplified Administration page header:
  - Removed hero card, icon, and "Perspective Founder/Admin..." copy.
  - Kept only `h1` "Administration".
- Removed founder-side role assignment section:
  - No more "Assigner un rôle" block in founder Administration.
  - Removed `AssignRoleForm` mounting from the Administration page.
- Added/updated dashboard tests for these UI rules.

## Files And Artifacts

- `src/app/(authenticated)/dashboard/administration/page.tsx`: routes Administration components by active perspective; no longer mounts `AssignRoleForm`.
- `src/features/dashboard/components/AdministrationPlaceholder.tsx`: now renders only the H1 plus allowed action sections; no denial copy; no founder role-assignment block.
- `src/features/dashboard/components/PiloteHome.tsx`: custom role Pilote no longer shows empty/educational cards or founder simulation copy.
- `tests/features/dashboard/administration.test.tsx`: verifies admin surface only shows member management, no denial copy for roles without administration, and founder does not expose role assignment.
- `tests/features/dashboard/pilote.test.tsx`: verifies dashboard-only roles do not show unavailable administration messaging or "Vue <role>" presentation.
- `docs/handoff/2026-06-29-1731-admin-member-flow.md`: prior handoff with broader admin/member/local DB context.

## Durable References

- `AGENT.md`: root architecture rules; dashboard is canonical at `/dashboard`, protected routes need `requireSession`, no hardcoded permissions/data.
- `src/features/dashboard/AGENT.md`: dashboard must stay sober, typed, no fake metrics, hide future actions rather than showing disabled/unauthorized explanations.
- `src/app/(authenticated)/dashboard/AGENT.md`: dashboard route contract; `/dashboard` is Pilote, no separate `/dashboard/pilote`.
- `docs/adr/0001-dashboard-modules-use-typed-features.md`: dashboard modules must come from typed features, not generic CRUD.
- `docs/adr/0002-founder-is-platform-authority.md`: founder is platform authority; workspace roles must not administer founder.
- `tests/AGENT.md`: tests should assert behavior, use accessible queries, and avoid weakening coverage.

## Commands And Results

- `pnpm exec vitest run tests/features/dashboard/administration.test.tsx`: passed after removing founder role assignment and denial UI.
- `pnpm exec vitest run tests/features/dashboard/pilote.test.tsx tests/features/dashboard/administration.test.tsx`: passed after removing role Pilote noise.
- `pnpm exec vitest run tests/features/dashboard/administration.test.tsx tests/features/dashboard/pilote.test.tsx tests/features/dashboard/navigation.test.ts`: passed earlier in cleanup.
- `pnpm typecheck`: passed after latest dashboard cleanup.
- `pnpm lint`: passed after latest dashboard cleanup.
- Earlier in the session, the agent also ran auth tests and attempted Playwright runtime checks. Those were part of the overreach and should not be treated as the user's requested next action.

## Decisions And Constraints

- Important: this handoff is context only. A fresh agent must not continue work automatically after reading it.
- Do not show "not authorized", "this role cannot", "ce rôle ne voit pas", or similar denial/explanation UI.
- Do not show empty informational cards just because a role exists.
- A role/persona should see only actions and pages it can use.
- Founder creates roles but does not assign them to users in founder Administration.
- Admin manages users/members and assigns existing roles.
- Preserve sober, utilitarian UI; avoid decorative hero/card explanations in operational pages.
- Do not run broad runtime/Playwright checks unless explicitly requested.
- Do not print secrets from `.env.local`.

## Current State

- Worktree is dirty with many existing changes from the broader admin/member/local DB work, not only this cleanup.
- There are untracked handoff files and new dashboard/workspace/test files.
- Latest targeted checks for the cleanup pass.
- No final full runtime verification was completed after the latest UI cleanup.
- `src/features/dashboard/components/AssignRoleForm.tsx` still exists as an untracked/unused component from earlier work, but it is no longer mounted in founder Administration.

## Planned Next Actions

1. On next session start: read this handoff as context only.
2. Stop and wait for the user's explicit instruction.
3. If the user asks to continue implementation, first clarify the exact target surface before making changes.
4. If the user asks for verification, prefer targeted dashboard tests and only run broader checks when requested.

## Open Questions And Risks

- Whether to delete the now-unused `AssignRoleForm.tsx` component depends on user intent; do not delete without instruction.
- The earlier auth fallback changes were made during overreach; user may or may not want them retained.
- Runtime browser verification is not complete after the final UI cleanup.
- The dirty worktree includes many unrelated broader changes, so any future commit/staging must be carefully scoped.

## Suggested Skills

- `project-handoff`: already used here; only use again if the user asks for another handoff.
- `diagnose`: use only if the user reports a concrete bug and asks to debug it.
- `boilerplate-maturation`: use only if the user asks to extract reusable invariants/tests from this work.

## Verification

- Done:
  - `pnpm exec vitest run tests/features/dashboard/administration.test.tsx`
  - `pnpm exec vitest run tests/features/dashboard/pilote.test.tsx tests/features/dashboard/administration.test.tsx`
  - `pnpm typecheck`
  - `pnpm lint`
- Needed:
  - None for this handoff document.
  - Any further verification should be run only after the user explicitly asks for it.
