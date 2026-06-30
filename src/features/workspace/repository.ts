import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/auth-schema";
import {
  workspace,
  workspaceCustomRole,
  workspaceMembership,
  workspaceMembershipCustomRole,
} from "./schema";
import type { WorkspaceRole } from "./roles";
import type {
  WorkspaceCustomRoleSummary,
  WorkspaceMemberRoleSummary,
  WorkspaceSummary,
} from "./types";

const CREDENTIAL_PROVIDER_ID = "credential";

export type WorkspaceAdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type WorkspaceMembershipRecord = {
  id: string;
  role: WorkspaceRole;
  userId?: string;
  workspaceId?: string;
};

export async function listWorkspaces(): Promise<WorkspaceSummary[]> {
  return db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    })
    .from(workspace)
    .orderBy(workspace.name);
}

export async function findWorkspaceBySlug(
  slug: string,
): Promise<WorkspaceSummary | null> {
  const [row] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);

  return row ?? null;
}

export async function insertWorkspace(values: {
  id: string;
  name: string;
  slug: string;
  createdById: string | null;
  now: Date;
}): Promise<WorkspaceSummary> {
  const [row] = await db
    .insert(workspace)
    .values({
      id: values.id,
      name: values.name,
      slug: values.slug,
      createdById: values.createdById,
      createdAt: values.now,
      updatedAt: values.now,
    })
    .returning({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    });

  if (!row) throw new Error("Failed to create workspace");
  return row;
}

export async function updateWorkspace(values: {
  id: string;
  name: string;
  slug: string;
  now: Date;
}): Promise<WorkspaceSummary | null> {
  const [row] = await db
    .update(workspace)
    .set({
      name: values.name,
      slug: values.slug,
      updatedAt: values.now,
    })
    .where(eq(workspace.id, values.id))
    .returning({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    });

  return row ?? null;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await db.delete(workspace).where(eq(workspace.id, id));
}

export async function listWorkspacesForMember(
  userId: string,
): Promise<WorkspaceSummary[]> {
  return db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    })
    .from(workspaceMembership)
    .innerJoin(workspace, eq(workspace.id, workspaceMembership.workspaceId))
    .where(
      and(
        eq(workspaceMembership.userId, userId),
        eq(workspaceMembership.isActive, true),
      ),
    )
    .orderBy(workspace.name);
}

function toWorkspaceCustomRoleSummary(row: {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: unknown;
}): WorkspaceCustomRoleSummary {
  const permissions =
    typeof row.permissions === "object" && row.permissions !== null
      ? (row.permissions as WorkspaceCustomRoleSummary["permissions"])
      : ({
          navigation: ["dashboard"],
        } satisfies WorkspaceCustomRoleSummary["permissions"]);

  return {
    ...row,
    permissions,
  };
}

export async function listWorkspaceCustomRoles(
  workspaceId: string,
): Promise<WorkspaceCustomRoleSummary[]> {
  const rows = await db
    .select({
      id: workspaceCustomRole.id,
      workspaceId: workspaceCustomRole.workspaceId,
      name: workspaceCustomRole.name,
      slug: workspaceCustomRole.slug,
      description: workspaceCustomRole.description,
      permissions: workspaceCustomRole.permissions,
    })
    .from(workspaceCustomRole)
    .where(eq(workspaceCustomRole.workspaceId, workspaceId))
    .orderBy(workspaceCustomRole.name);

  return rows.map(toWorkspaceCustomRoleSummary);
}

export async function listWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMemberRoleSummary[]> {
  return db
    .select({
      membershipId: workspaceMembership.id,
      workspaceId: workspaceMembership.workspaceId,
      userId: workspaceMembership.userId,
      name: user.name,
      email: user.email,
      bootstrapRole: workspaceMembership.role,
      customRoleId: workspaceMembershipCustomRole.roleId,
    })
    .from(workspaceMembership)
    .innerJoin(user, eq(user.id, workspaceMembership.userId))
    .leftJoin(
      workspaceMembershipCustomRole,
      eq(workspaceMembershipCustomRole.membershipId, workspaceMembership.id),
    )
    .where(
      and(
        eq(workspaceMembership.workspaceId, workspaceId),
        eq(workspaceMembership.isActive, true),
      ),
    )
    .orderBy(user.name);
}

export async function findWorkspaceCustomRoleBySlug(values: {
  workspaceId: string;
  slug: string;
}): Promise<WorkspaceCustomRoleSummary | null> {
  const [row] = await db
    .select({
      id: workspaceCustomRole.id,
      workspaceId: workspaceCustomRole.workspaceId,
      name: workspaceCustomRole.name,
      slug: workspaceCustomRole.slug,
      description: workspaceCustomRole.description,
      permissions: workspaceCustomRole.permissions,
    })
    .from(workspaceCustomRole)
    .where(
      and(
        eq(workspaceCustomRole.workspaceId, values.workspaceId),
        eq(workspaceCustomRole.slug, values.slug),
      ),
    )
    .limit(1);

  return row ? toWorkspaceCustomRoleSummary(row) : null;
}

export async function findWorkspaceCustomRoleById(
  roleId: string,
): Promise<WorkspaceCustomRoleSummary | null> {
  const [row] = await db
    .select({
      id: workspaceCustomRole.id,
      workspaceId: workspaceCustomRole.workspaceId,
      name: workspaceCustomRole.name,
      slug: workspaceCustomRole.slug,
      description: workspaceCustomRole.description,
      permissions: workspaceCustomRole.permissions,
    })
    .from(workspaceCustomRole)
    .where(eq(workspaceCustomRole.id, roleId))
    .limit(1);

  return row ? toWorkspaceCustomRoleSummary(row) : null;
}

export async function insertWorkspaceCustomRole(values: {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: WorkspaceCustomRoleSummary["permissions"];
  createdById: string | null;
  now: Date;
}): Promise<WorkspaceCustomRoleSummary> {
  const [row] = await db
    .insert(workspaceCustomRole)
    .values({
      id: values.id,
      workspaceId: values.workspaceId,
      name: values.name,
      slug: values.slug,
      description: values.description,
      permissions: values.permissions,
      createdById: values.createdById,
      createdAt: values.now,
      updatedAt: values.now,
    })
    .returning({
      id: workspaceCustomRole.id,
      workspaceId: workspaceCustomRole.workspaceId,
      name: workspaceCustomRole.name,
      slug: workspaceCustomRole.slug,
      description: workspaceCustomRole.description,
      permissions: workspaceCustomRole.permissions,
    });

  if (!row) throw new Error("Failed to create workspace role");
  return toWorkspaceCustomRoleSummary(row);
}

export async function updateWorkspaceCustomRole(values: {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: WorkspaceCustomRoleSummary["permissions"];
  now: Date;
}): Promise<WorkspaceCustomRoleSummary | null> {
  const [row] = await db
    .update(workspaceCustomRole)
    .set({
      workspaceId: values.workspaceId,
      name: values.name,
      slug: values.slug,
      description: values.description,
      permissions: values.permissions,
      updatedAt: values.now,
    })
    .where(eq(workspaceCustomRole.id, values.id))
    .returning({
      id: workspaceCustomRole.id,
      workspaceId: workspaceCustomRole.workspaceId,
      name: workspaceCustomRole.name,
      slug: workspaceCustomRole.slug,
      description: workspaceCustomRole.description,
      permissions: workspaceCustomRole.permissions,
    });

  return row ? toWorkspaceCustomRoleSummary(row) : null;
}

export async function deleteWorkspaceCustomRole(roleId: string): Promise<void> {
  await db
    .delete(workspaceCustomRole)
    .where(eq(workspaceCustomRole.id, roleId));
}

export async function findWorkspaceById(
  id: string,
): Promise<WorkspaceSummary | null> {
  const [row] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    })
    .from(workspace)
    .where(eq(workspace.id, id))
    .limit(1);

  return row ?? null;
}

export async function findWorkspaceAdminUserByEmail(
  email: string,
): Promise<WorkspaceAdminUser | null> {
  const [row] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1);

  return row ?? null;
}

export async function findWorkspaceAdminUserById(
  id: string,
): Promise<WorkspaceAdminUser | null> {
  const [row] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  return row ?? null;
}

export async function insertWorkspaceAdminUser(values: {
  id: string;
  email: string;
  name: string;
  now: Date;
}): Promise<WorkspaceAdminUser> {
  const [row] = await db
    .insert(user)
    .values({
      id: values.id,
      email: values.email.toLowerCase(),
      name: values.name,
      emailVerified: true,
      role: "user",
      createdAt: values.now,
      updatedAt: values.now,
    })
    .returning({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

  if (!row) throw new Error("Failed to create user");
  return row;
}

export async function updateWorkspaceAdminUser(values: {
  id: string;
  name: string;
  email: string;
  now: Date;
}): Promise<WorkspaceAdminUser | null> {
  const [row] = await db
    .update(user)
    .set({
      name: values.name,
      email: values.email.toLowerCase(),
      updatedAt: values.now,
    })
    .where(eq(user.id, values.id))
    .returning({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

  return row ?? null;
}

export async function findCredentialAccount(
  userId: string,
): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.userId, userId),
        eq(account.providerId, CREDENTIAL_PROVIDER_ID),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function insertCredentialAccount(values: {
  id: string;
  userId: string;
  passwordHash: string;
  now: Date;
}): Promise<void> {
  await db.insert(account).values({
    id: values.id,
    accountId: values.userId,
    providerId: CREDENTIAL_PROVIDER_ID,
    userId: values.userId,
    password: values.passwordHash,
    createdAt: values.now,
    updatedAt: values.now,
  });
}

export async function findWorkspaceMembership(values: {
  workspaceId: string;
  userId: string;
}): Promise<WorkspaceMembershipRecord | null> {
  const [row] = await db
    .select({
      id: workspaceMembership.id,
      role: workspaceMembership.role,
    })
    .from(workspaceMembership)
    .where(
      and(
        eq(workspaceMembership.workspaceId, values.workspaceId),
        eq(workspaceMembership.userId, values.userId),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function findWorkspaceMembershipById(
  membershipId: string,
): Promise<WorkspaceMembershipRecord | null> {
  const [row] = await db
    .select({
      id: workspaceMembership.id,
      role: workspaceMembership.role,
      userId: workspaceMembership.userId,
      workspaceId: workspaceMembership.workspaceId,
    })
    .from(workspaceMembership)
    .where(eq(workspaceMembership.id, membershipId))
    .limit(1);

  return row ?? null;
}

export async function insertWorkspaceMembership(values: {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  now: Date;
}): Promise<void> {
  await db.insert(workspaceMembership).values({
    id: values.id,
    workspaceId: values.workspaceId,
    userId: values.userId,
    role: values.role,
    isActive: true,
    createdAt: values.now,
    updatedAt: values.now,
  });
}

export async function updateWorkspaceMembershipRole(values: {
  membershipId: string;
  role: WorkspaceRole;
  now: Date;
}): Promise<void> {
  await db
    .update(workspaceMembership)
    .set({
      role: values.role,
      isActive: true,
      updatedAt: values.now,
    })
    .where(eq(workspaceMembership.id, values.membershipId));
}

export async function updateWorkspaceMembershipWorkspace(values: {
  membershipId: string;
  workspaceId: string;
  now: Date;
}): Promise<void> {
  await db
    .update(workspaceMembership)
    .set({
      workspaceId: values.workspaceId,
      isActive: true,
      updatedAt: values.now,
    })
    .where(eq(workspaceMembership.id, values.membershipId));
}

export async function deleteWorkspaceMembership(
  membershipId: string,
): Promise<void> {
  await db
    .delete(workspaceMembership)
    .where(eq(workspaceMembership.id, membershipId));
}

export async function upsertWorkspaceMembershipCustomRole(values: {
  membershipId: string;
  roleId: string;
  assignedById: string | null;
  now: Date;
}): Promise<void> {
  await db
    .insert(workspaceMembershipCustomRole)
    .values({
      membershipId: values.membershipId,
      roleId: values.roleId,
      assignedById: values.assignedById,
      assignedAt: values.now,
    })
    .onConflictDoUpdate({
      target: workspaceMembershipCustomRole.membershipId,
      set: {
        roleId: values.roleId,
        assignedById: values.assignedById,
        assignedAt: values.now,
      },
    });
}

export async function deleteWorkspaceMembershipCustomRole(
  membershipId: string,
): Promise<void> {
  await db
    .delete(workspaceMembershipCustomRole)
    .where(eq(workspaceMembershipCustomRole.membershipId, membershipId));
}
