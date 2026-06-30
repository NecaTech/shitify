import type { PlatformRole } from "@/lib/auth/roles";

export const bootstrapWorkspaceRoles = ["owner", "admin", "member"] as const;

export type BootstrapWorkspaceRole = (typeof bootstrapWorkspaceRoles)[number];
export type WorkspaceRole = BootstrapWorkspaceRole;

export const assignableWorkspaceRoles = [
  "admin",
  "member",
] as const satisfies readonly WorkspaceRole[];

export type AssignableWorkspaceRole = (typeof assignableWorkspaceRoles)[number];

export const bootstrapWorkspaceRoleDefinitions = {
  owner: { label: "Owner" },
  admin: { label: "Admin" },
  member: { label: "Member" },
} as const satisfies Record<WorkspaceRole, { label: string }>;

const workspaceRoleRank = {
  owner: 60,
  admin: 50,
  member: 10,
} as const satisfies Record<WorkspaceRole, number>;

export function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return (
    typeof value === "string" &&
    bootstrapWorkspaceRoles.includes(value as WorkspaceRole)
  );
}

export function isAssignableWorkspaceRole(
  value: unknown,
): value is AssignableWorkspaceRole {
  return (
    typeof value === "string" &&
    assignableWorkspaceRoles.includes(value as AssignableWorkspaceRole)
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

export function canAssignWorkspaceRole(
  actorRole: WorkspaceRole,
  targetRole: AssignableWorkspaceRole,
) {
  return canManageWorkspaceRole(actorRole, targetRole);
}

export const dashboardNavigationPermissions = [
  "dashboard",
  "administration",
] as const;

export type DashboardNavigationPermission =
  (typeof dashboardNavigationPermissions)[number];

export type WorkspaceCustomRolePermissions = {
  navigation: DashboardNavigationPermission[];
};

export function isDashboardNavigationPermission(
  value: unknown,
): value is DashboardNavigationPermission {
  return (
    typeof value === "string" &&
    dashboardNavigationPermissions.includes(
      value as DashboardNavigationPermission,
    )
  );
}

export function normalizeWorkspaceRolePermissions(
  permissions: Partial<WorkspaceCustomRolePermissions>,
): WorkspaceCustomRolePermissions {
  const navigation = Array.from(
    new Set(
      (permissions.navigation ?? ["dashboard"]).filter(
        isDashboardNavigationPermission,
      ),
    ),
  );

  return {
    navigation: navigation.length > 0 ? navigation : ["dashboard"],
  };
}

export function canWorkspaceRoleManagePlatformRole(
  _workspaceRole: WorkspaceRole,
  _platformRole: PlatformRole,
) {
  return false;
}
