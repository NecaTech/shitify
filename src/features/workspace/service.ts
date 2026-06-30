import "server-only";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { canManagePlatformRole, isPlatformRole } from "@/lib/auth/roles";
import {
  deleteWorkspace,
  deleteWorkspaceCustomRole,
  deleteWorkspaceMembership,
  deleteWorkspaceMembershipCustomRole,
  findCredentialAccount,
  findWorkspaceCustomRoleById,
  findWorkspaceAdminUserById,
  findWorkspaceAdminUserByEmail,
  findWorkspaceById,
  findWorkspaceBySlug,
  findWorkspaceCustomRoleBySlug,
  insertWorkspace,
  findWorkspaceMembership,
  findWorkspaceMembershipById,
  insertWorkspaceCustomRole,
  insertCredentialAccount,
  insertWorkspaceAdminUser,
  insertWorkspaceMembership,
  listWorkspaceMembers,
  listWorkspaceCustomRoles,
  listWorkspaces,
  listWorkspacesForMember,
  updateWorkspace,
  updateWorkspaceAdminUser,
  updateWorkspaceMembershipWorkspace,
  updateWorkspaceMembershipRole,
  updateWorkspaceCustomRole,
  upsertWorkspaceMembershipCustomRole,
} from "./repository";
import type { PlatformRole } from "@/lib/auth/roles";
import {
  canAssignWorkspaceRole,
  canManageWorkspaceRole,
  isAssignableWorkspaceRole,
  normalizeWorkspaceRolePermissions,
  workspaceRoleAtLeast,
} from "./roles";
import type {
  AssignableWorkspaceRole,
  WorkspaceCustomRolePermissions,
} from "./roles";
import type {
  WorkspaceCustomRoleSummary,
  WorkspaceMemberRoleSummary,
  WorkspaceSummary,
} from "./types";

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

export type WorkspaceAdminUpdateInput = {
  actorRole: PlatformRole;
  membershipId: string;
  workspaceId: string;
  name: string;
  email: string;
};

export type WorkspaceAdminUpdateResult = WorkspaceMemberRoleSummary;

export type WorkspaceAdminDeletionInput = {
  actorRole: PlatformRole;
  membershipId: string;
};

export type WorkspaceAdminDeletionResult = {
  membershipId: string;
};

export type WorkspaceMemberMutationInput = {
  actorRole: PlatformRole;
  actorUserId: string;
  membershipId?: string;
  workspaceId: string;
  name: string;
  email: string;
  initialPassword?: string;
  customRoleId?: string | null;
};

export type WorkspaceMemberMutationResult = WorkspaceMemberRoleSummary;

export type WorkspaceMemberDeletionInput = {
  actorRole: PlatformRole;
  actorUserId: string;
  membershipId: string;
};

export type WorkspaceMemberDeletionResult = {
  membershipId: string;
};

export type WorkspaceCreationInput = {
  actorRole: PlatformRole;
  actorUserId: string;
  name: string;
};

export type WorkspaceMutationResult = WorkspaceSummary;

export type WorkspaceUpdateInput = WorkspaceCreationInput & {
  workspaceId: string;
};

export type WorkspaceDeletionInput = {
  actorRole: PlatformRole;
  workspaceId: string;
};

export type WorkspaceDeletionResult = {
  workspaceId: string;
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

export type WorkspaceCustomRoleCreationInput = {
  actorRole: PlatformRole;
  actorUserId: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  permissions: Partial<WorkspaceCustomRolePermissions>;
};

export type WorkspaceCustomRoleCreationResult = WorkspaceCustomRoleSummary;

export type WorkspaceCustomRoleUpdateInput = {
  actorRole: PlatformRole;
  actorUserId: string;
  roleId: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  permissions: Partial<WorkspaceCustomRolePermissions>;
};

export type WorkspaceCustomRoleUpdateResult = WorkspaceCustomRoleSummary;

export type WorkspaceCustomRoleAssignmentInput = {
  actorRole: PlatformRole;
  actorUserId: string;
  membershipId: string;
  roleId: string;
};

export type WorkspaceCustomRoleAssignmentResult = {
  membershipId: string;
  roleId: string;
};

export async function getAdministrationWorkspaceOptions({
  actorRole,
  actorUserId,
}: {
  actorRole: PlatformRole;
  actorUserId: string;
}): Promise<WorkspaceSummary[]> {
  if (canManagePlatformRole({ role: actorRole })) {
    return listWorkspaces();
  }

  return listWorkspacesForMember(actorUserId);
}

export async function getWorkspaceCustomRoleOptions(
  workspaceId: string,
): Promise<WorkspaceCustomRoleSummary[]> {
  return listWorkspaceCustomRoles(workspaceId);
}

export async function getWorkspaceMemberRoleOptions(
  workspaceId: string,
): Promise<WorkspaceMemberRoleSummary[]> {
  return listWorkspaceMembers(workspaceId);
}

export async function createWorkspace({
  actorRole,
  actorUserId,
  name,
}: WorkspaceCreationInput): Promise<WorkspaceMutationResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can create workspaces");
  }

  const trimmedName = name.trim();
  const slug = slugifyName(trimmedName);
  if (!slug) {
    throw new Error("Workspace name is invalid");
  }

  const existingWorkspace = await findWorkspaceBySlug(slug);
  if (existingWorkspace) {
    throw new Error("Workspace already exists");
  }

  return insertWorkspace({
    id: randomUUID(),
    name: trimmedName,
    slug,
    createdById: actorUserId === "local_founder" ? null : actorUserId,
    now: new Date(),
  });
}

export async function updateWorkspaceConfiguration({
  actorRole,
  workspaceId,
  name,
}: WorkspaceUpdateInput): Promise<WorkspaceMutationResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can configure workspaces");
  }

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const trimmedName = name.trim();
  const slug = slugifyName(trimmedName);
  if (!slug) {
    throw new Error("Workspace name is invalid");
  }

  const duplicateWorkspace = await findWorkspaceBySlug(slug);
  if (duplicateWorkspace && duplicateWorkspace.id !== workspaceId) {
    throw new Error("Workspace already exists");
  }

  const updatedWorkspace = await updateWorkspace({
    id: workspaceId,
    name: trimmedName,
    slug,
    now: new Date(),
  });
  if (!updatedWorkspace) {
    throw new Error("Workspace not found");
  }

  return updatedWorkspace;
}

export async function deleteWorkspaceConfiguration({
  actorRole,
  workspaceId,
}: WorkspaceDeletionInput): Promise<WorkspaceDeletionResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can delete workspaces");
  }

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  await deleteWorkspace(workspaceId);
  return { workspaceId };
}

export async function createWorkspaceCustomRole({
  actorRole,
  workspaceId,
  name,
  description,
  permissions,
}: WorkspaceCustomRoleCreationInput): Promise<WorkspaceCustomRoleCreationResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can create workspace roles");
  }

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const trimmedName = name.trim();
  const slug = slugifyName(trimmedName);
  if (!slug) {
    throw new Error("Workspace role name is invalid");
  }

  const existingRole = await findWorkspaceCustomRoleBySlug({
    workspaceId,
    slug,
  });
  if (existingRole) {
    throw new Error("Workspace role already exists");
  }

  return insertWorkspaceCustomRole({
    id: randomUUID(),
    workspaceId,
    name: trimmedName,
    slug,
    description: description?.trim() || null,
    permissions: normalizeWorkspaceRolePermissions(permissions),
    createdById: null,
    now: new Date(),
  });
}

export async function updateWorkspaceCustomRoleConfiguration({
  actorRole,
  roleId,
  workspaceId,
  name,
  description,
  permissions,
}: WorkspaceCustomRoleUpdateInput): Promise<WorkspaceCustomRoleUpdateResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can configure workspace roles");
  }

  const existingRole = await findWorkspaceCustomRoleById(roleId);
  if (!existingRole) {
    throw new Error("Workspace custom role not found");
  }

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (workspaceId !== existingRole.workspaceId) {
    throw new Error("Workspace role moves are not supported yet");
  }

  const trimmedName = name.trim();
  const slug = slugifyName(trimmedName);
  if (!slug) {
    throw new Error("Workspace role name is invalid");
  }

  const duplicateRole = await findWorkspaceCustomRoleBySlug({
    workspaceId,
    slug,
  });
  if (duplicateRole && duplicateRole.id !== roleId) {
    throw new Error("Workspace role already exists");
  }

  const updatedRole = await updateWorkspaceCustomRole({
    id: roleId,
    workspaceId,
    name: trimmedName,
    slug,
    description: description?.trim() || null,
    permissions: normalizeWorkspaceRolePermissions(permissions),
    now: new Date(),
  });

  if (!updatedRole) {
    throw new Error("Workspace custom role not found");
  }

  return updatedRole;
}

export async function deleteWorkspaceCustomRoleConfiguration({
  actorRole,
  roleId,
}: {
  actorRole: PlatformRole;
  roleId: string;
}): Promise<{ roleId: string }> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can delete workspace roles");
  }

  const existingRole = await findWorkspaceCustomRoleById(roleId);
  if (!existingRole) {
    throw new Error("Workspace custom role not found");
  }

  await deleteWorkspaceCustomRole(roleId);
  return { roleId };
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

export async function updateWorkspaceAdmin({
  actorRole,
  membershipId,
  workspaceId,
  name,
  email,
}: WorkspaceAdminUpdateInput): Promise<WorkspaceAdminUpdateResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can configure workspace admins");
  }

  const membership = await findWorkspaceMembershipById(membershipId);
  if (!membership?.userId || !membership.workspaceId) {
    throw new Error("Workspace membership not found");
  }

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const user = await findWorkspaceAdminUserById(membership.userId);
  if (!user) {
    throw new Error("Workspace admin user not found");
  }
  if (isPlatformRole(user.role) && user.role === "founder") {
    throw new Error("Founder accounts cannot be managed as workspace admins");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const duplicateUser = await findWorkspaceAdminUserByEmail(normalizedEmail);
  if (duplicateUser && duplicateUser.id !== user.id) {
    throw new Error("Email already belongs to another user");
  }

  const now = new Date();
  const updatedUser = await updateWorkspaceAdminUser({
    id: user.id,
    name: name.trim(),
    email: normalizedEmail,
    now,
  });
  if (!updatedUser) {
    throw new Error("Workspace admin user not found");
  }

  if (workspaceId !== membership.workspaceId) {
    await updateWorkspaceMembershipWorkspace({
      membershipId,
      workspaceId,
      now,
    });
  }

  return {
    membershipId,
    workspaceId,
    userId: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    bootstrapRole: "admin",
    customRoleId: null,
  };
}

export async function deleteWorkspaceAdmin({
  actorRole,
  membershipId,
}: WorkspaceAdminDeletionInput): Promise<WorkspaceAdminDeletionResult> {
  if (!canManagePlatformRole({ role: actorRole })) {
    throw new Error("Only a founder can delete workspace admins");
  }

  const membership = await findWorkspaceMembershipById(membershipId);
  if (!membership) {
    throw new Error("Workspace membership not found");
  }

  if (membership.userId) {
    const user = await findWorkspaceAdminUserById(membership.userId);
    if (isPlatformRole(user?.role) && user.role === "founder") {
      throw new Error("Founder accounts cannot be managed as workspace admins");
    }
  }

  await deleteWorkspaceMembership(membershipId);
  return { membershipId };
}

async function assertCanManageWorkspaceMembers(values: {
  actorRole: PlatformRole;
  actorUserId: string;
  workspaceId: string;
}) {
  if (canManagePlatformRole({ role: values.actorRole })) return;

  const actorMembership = await findWorkspaceMembership({
    workspaceId: values.workspaceId,
    userId: values.actorUserId,
  });
  if (
    !actorMembership ||
    !workspaceRoleAtLeast(actorMembership.role, "admin")
  ) {
    throw new Error("Workspace admin membership required to manage members");
  }
}

export async function createWorkspaceMember({
  actorRole,
  actorUserId,
  workspaceId,
  name,
  email,
  initialPassword,
  customRoleId,
}: WorkspaceMemberMutationInput): Promise<WorkspaceMemberMutationResult> {
  await assertCanManageWorkspaceMembers({
    actorRole,
    actorUserId,
    workspaceId,
  });

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  if (!initialPassword) {
    throw new Error("Initial password required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();
  const existingUser = await findWorkspaceAdminUserByEmail(normalizedEmail);
  if (isPlatformRole(existingUser?.role) && existingUser.role === "founder") {
    throw new Error("Founder accounts cannot be managed as workspace members");
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
  const membershipId = existingMembership?.id ?? randomUUID();

  if (existingMembership) {
    if (existingMembership.role !== "member") {
      await updateWorkspaceMembershipRole({
        membershipId,
        role: "member",
        now,
      });
    }
  } else {
    await insertWorkspaceMembership({
      id: membershipId,
      workspaceId,
      userId: user.id,
      role: "member",
      now,
    });
  }

  await setMembershipCustomRole({
    actorRole,
    actorUserId,
    membershipId,
    workspaceId,
    customRoleId: customRoleId ?? null,
    now,
  });

  return {
    membershipId,
    workspaceId,
    userId: user.id,
    name: user.name,
    email: user.email,
    bootstrapRole: "member",
    customRoleId: customRoleId ?? null,
  };
}

export async function updateWorkspaceMember({
  actorRole,
  actorUserId,
  membershipId,
  workspaceId,
  name,
  email,
  customRoleId,
}: WorkspaceMemberMutationInput): Promise<WorkspaceMemberMutationResult> {
  if (!membershipId) {
    throw new Error("Workspace membership not found");
  }

  const membership = await findWorkspaceMembershipById(membershipId);
  if (!membership?.userId || !membership.workspaceId) {
    throw new Error("Workspace membership not found");
  }
  if (membership.role !== "member") {
    throw new Error("Only workspace members can be managed here");
  }

  await assertCanManageWorkspaceMembers({
    actorRole,
    actorUserId,
    workspaceId: membership.workspaceId,
  });

  const workspace = await findWorkspaceById(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const user = await findWorkspaceAdminUserById(membership.userId);
  if (!user) {
    throw new Error("Workspace member user not found");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const duplicateUser = await findWorkspaceAdminUserByEmail(normalizedEmail);
  if (duplicateUser && duplicateUser.id !== user.id) {
    throw new Error("Email already belongs to another user");
  }

  const now = new Date();
  const updatedUser = await updateWorkspaceAdminUser({
    id: user.id,
    name: name.trim(),
    email: normalizedEmail,
    now,
  });
  if (!updatedUser) {
    throw new Error("Workspace member user not found");
  }

  if (workspaceId !== membership.workspaceId) {
    await updateWorkspaceMembershipWorkspace({
      membershipId,
      workspaceId,
      now,
    });
  }

  await setMembershipCustomRole({
    actorRole,
    actorUserId,
    membershipId,
    workspaceId,
    customRoleId: customRoleId ?? null,
    now,
  });

  return {
    membershipId,
    workspaceId,
    userId: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    bootstrapRole: "member",
    customRoleId: customRoleId ?? null,
  };
}

export async function deleteWorkspaceMember({
  actorRole,
  actorUserId,
  membershipId,
}: WorkspaceMemberDeletionInput): Promise<WorkspaceMemberDeletionResult> {
  const membership = await findWorkspaceMembershipById(membershipId);
  if (!membership?.workspaceId) {
    throw new Error("Workspace membership not found");
  }
  if (membership.role !== "member") {
    throw new Error("Only workspace members can be deleted here");
  }

  await assertCanManageWorkspaceMembers({
    actorRole,
    actorUserId,
    workspaceId: membership.workspaceId,
  });

  await deleteWorkspaceMembership(membershipId);
  return { membershipId };
}

async function setMembershipCustomRole(values: {
  actorRole: PlatformRole;
  actorUserId: string;
  membershipId: string;
  workspaceId: string;
  customRoleId?: string | null;
  now: Date;
}) {
  if (!values.customRoleId) {
    await deleteWorkspaceMembershipCustomRole(values.membershipId);
    return;
  }

  const customRole = await findWorkspaceCustomRoleById(values.customRoleId);
  if (!customRole || customRole.workspaceId !== values.workspaceId) {
    throw new Error("Workspace custom role not found");
  }

  await upsertWorkspaceMembershipCustomRole({
    membershipId: values.membershipId,
    roleId: values.customRoleId,
    assignedById: canManagePlatformRole({ role: values.actorRole })
      ? null
      : values.actorUserId,
    now: values.now,
  });
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

export async function assignWorkspaceMemberCustomRole({
  actorRole,
  actorUserId,
  membershipId,
  roleId,
}: WorkspaceCustomRoleAssignmentInput): Promise<WorkspaceCustomRoleAssignmentResult> {
  const membership = await findWorkspaceMembershipById(membershipId);
  if (!membership || !membership.workspaceId) {
    throw new Error("Workspace membership not found");
  }

  const customRole = await findWorkspaceCustomRoleById(roleId);
  if (!customRole || customRole.workspaceId !== membership.workspaceId) {
    throw new Error("Workspace custom role not found");
  }

  const isPlatformManager = canManagePlatformRole({ role: actorRole });

  if (!isPlatformManager) {
    const actorMembership = await findWorkspaceMembership({
      workspaceId: membership.workspaceId,
      userId: actorUserId,
    });
    if (
      !actorMembership ||
      !workspaceRoleAtLeast(actorMembership.role, "admin")
    ) {
      throw new Error(
        "Workspace admin membership required to assign custom roles",
      );
    }
  }

  await upsertWorkspaceMembershipCustomRole({
    membershipId,
    roleId,
    assignedById: isPlatformManager ? null : actorUserId,
    now: new Date(),
  });

  return { membershipId, roleId };
}

function slugifyName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
