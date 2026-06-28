# Founder Is Platform Authority

The boilerplate separates platform authority from client workspace governance.
The global user role stays intentionally narrow (`founder` or default `user`),
while client permissions live in workspace memberships. A founder can recover
and maintain the whole application without being a member of every workspace,
and workspace roles must never administer platform roles.

**Status**: accepted

**Consequences**: founder protection belongs in domain guards and trusted
maintenance procedures, not in client administration screens. Future member
management may create owners, admins, managers, staff, editors, or viewers in a
workspace, but must not demote or delete founders.
