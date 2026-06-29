import "server-only";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { canManagePlatformRole, isPlatformRole } from "@/lib/auth/roles";
import {
  findCredentialAccount,
  findWorkspaceAdminUserByEmail,
  findWorkspaceById,
  findWorkspaceMembership,
  findWorkspaceMembershipById,
  insertCredentialAccount,
  insertWorkspaceAdminUser,
  insertWorkspaceMembership,
  listWorkspaces,
  updateWorkspaceMembershipRole,
} from "./repository";
import type { PlatformRole } from "@/lib/auth/roles";
import {
  canAssignWorkspaceRole,
  canManageWorkspaceRole,
  isAssignableWorkspaceRole,
} from "./roles";
import type { AssignableWorkspaceRole } from "./roles";
import type { WorkspaceSummary } from "./types";

export type WorkspaceAdminCreationInput = {
  actorRole: PlatformRole;
  workspaceId: string;
  name: string;
  email: string;
  initialPassword: string;
};

export type WorkspaceAdminCreationResult = {
  userId: string;
  workspaceId: string;
  userCreated: boolean;
  credentialCreated: boolean;
  membershipCreated: boolean;
  role: "admin";
};

export type WorkspaceRoleAssignmentInput = {
  actorUserId: string;
  membershipId: string;
  role: AssignableWorkspaceRole;
};

export type WorkspaceRoleAssignmentResult = {
  membershipId: string;
  role: AssignableWorkspaceRole;
};

export async function getAdministrationWorkspaceOptions(): Promise<
  WorkspaceSummary[]
> {
  return listWorkspaces();
}

export async function createWorkspaceAdmin({
  actorRole,
  workspaceId,
  name,
  email,
  initialPassword,
}: WorkspaceAdminCreationInput): Promise<WorkspaceAdminCreationResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can create workspace admins");
  }

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();
  const existingUser = await findWorkspaceAdminUserByEmail(normalizedEmail);

  if (isPlatformRole(existingUser?.role) && existingUser.role === "founder") {
    throw new Error("Founder accounts cannot be managed as workspace admins");
  }

  const user =
    existingUser ??
    (await insertWorkspaceAdminUser({
      id: randomUUID(),
      email: normalizedEmail,
      name: name.trim(),
      now,
    }));

  const existingAccount = await findCredentialAccount(user.id);
  if (!existingAccount) {
    await insertCredentialAccount({
      id: randomUUID(),
      userId: user.id,
      passwordHash: await hashPassword(initialPassword),
      now,
    });
  }

  const existingMembership = await findWorkspaceMembership({
    workspaceId,
    userId: user.id,
  });

  if (existingMembership) {
    if (existingMembership.role !== "admin") {
      await updateWorkspaceMembershipRole({
        membershipId: existingMembership.id,
        role: "admin",
        now,
      });
    }
  } else {
    await insertWorkspaceMembership({
      id: randomUUID(),
      workspaceId,
      userId: user.id,
      role: "admin",
      now,
    });
  }

  return {
    userId: user.id,
    workspaceId,
    userCreated: !existingUser,
    credentialCreated: !existingAccount,
    membershipCreated: !existingMembership,
    role: "admin",
  };
}

export async function assignWorkspaceMemberRole({
  actorUserId,
  membershipId,
  role,
}: WorkspaceRoleAssignmentInput): Promise<WorkspaceRoleAssignmentResult> {
  if (!isAssignableWorkspaceRole(role)) {
    throw new Error("Workspace role is not assignable by an admin");
  }

  const membership = await findWorkspaceMembershipById(membershipId);
  if (!membership || !membership.workspaceId) {
    throw new Error("Workspace membership not found");
  }

  const actorMembership = await findWorkspaceMembership({
    workspaceId: membership.workspaceId,
    userId: actorUserId,
  });
  if (!actorMembership) {
    throw new Error("Workspace membership required to assign roles");
  }

  const actorRole = actorMembership.role;
  if (!canAssignWorkspaceRole(actorRole, role)) {
    throw new Error("Workspace role is not high enough to assign this role");
  }

  if (!canManageWorkspaceRole(actorRole, membership.role)) {
    throw new Error("Workspace role is not high enough to manage this member");
  }

  await updateWorkspaceMembershipRole({
    membershipId,
    role,
    now: new Date(),
  });

  return { membershipId, role };
}
