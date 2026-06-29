import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/auth-schema";
import { workspace, workspaceMembership } from "./schema";
import type { WorkspaceRole } from "./roles";
import type { WorkspaceSummary } from "./types";

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
