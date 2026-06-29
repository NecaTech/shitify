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

export const assignableWorkspaceRoles = [
  "admin",
  "manager",
  "staff",
  "editor",
  "viewer",
] as const satisfies readonly WorkspaceRole[];

export type AssignableWorkspaceRole = (typeof assignableWorkspaceRoles)[number];

export const workspaceRoleDefinitions = {
  owner: {
    label: "Owner",
    description: "Supervise le workspace et peut attribuer le rôle admin.",
  },
  admin: {
    label: "Admin",
    description: "Gère les membres, les droits et les vues d'administration.",
  },
  manager: {
    label: "Manager",
    description: "Coordonne les opérations et consulte les espaces métier.",
  },
  staff: {
    label: "Staff",
    description: "Exécute les workflows opérationnels autorisés.",
  },
  editor: {
    label: "Editor",
    description: "Prépare et met à jour les contenus autorisés.",
  },
  viewer: {
    label: "Viewer",
    description: "Consulte uniquement les informations publiées pour son rôle.",
  },
} as const satisfies Record<
  WorkspaceRole,
  { label: string; description: string }
>;

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

export function canWorkspaceRoleManagePlatformRole(
  _workspaceRole: WorkspaceRole,
  _platformRole: PlatformRole,
) {
  return false;
}
