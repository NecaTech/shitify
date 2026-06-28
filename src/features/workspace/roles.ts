import type { PlatformRole } from "@/lib/auth/roles";

export const workspaceRoles = [
  "owner",
  "admin",
  "manager",
  "staff",
  "editor",
  "viewer",
] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

const workspaceRoleRank = {
  owner: 60,
  admin: 50,
  manager: 40,
  staff: 30,
  editor: 20,
  viewer: 10,
} as const satisfies Record<WorkspaceRole, number>;

export function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return (
    typeof value === "string" && workspaceRoles.includes(value as WorkspaceRole)
  );
}

export function compareWorkspaceRoles(
  left: WorkspaceRole,
  right: WorkspaceRole,
) {
  return workspaceRoleRank[left] - workspaceRoleRank[right];
}

export function workspaceRoleAtLeast(
  role: WorkspaceRole,
  minimumRole: WorkspaceRole,
) {
  return compareWorkspaceRoles(role, minimumRole) >= 0;
}

export function canManageWorkspaceRole(
  actorRole: WorkspaceRole,
  targetRole: WorkspaceRole,
) {
  return compareWorkspaceRoles(actorRole, targetRole) > 0;
}

export function canWorkspaceRoleManagePlatformRole(
  _workspaceRole: WorkspaceRole,
  _platformRole: PlatformRole,
) {
  return false;
}
