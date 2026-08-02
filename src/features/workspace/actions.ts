"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isPlatformRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import {
  dashboardNavigationPermissions,
  isAssignableWorkspaceRole,
} from "./roles";
import type { ActionResult } from "@/types/result";
import type {
  WorkspaceAdminCreationResult,
  WorkspaceAdminDeletionResult,
  WorkspaceAdminUpdateResult,
  WorkspaceCustomRoleAssignmentResult,
  WorkspaceCustomRoleCreationResult,
  WorkspaceCustomRoleUpdateResult,
  WorkspaceDeletionResult,
  WorkspaceMemberDeletionResult,
  WorkspaceMemberMutationResult,
  WorkspaceMutationResult,
  WorkspaceRoleAssignmentResult,
} from "./service";

const createWorkspaceAdminSchema = z.object({
  workspaceId: z.string().min(1, "Workspace requis"),
  name: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("Email invalide"),
  initialPassword: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères"),
});

const updateWorkspaceAdminSchema = z.object({
  membershipId: z.string().min(1, "Admin requis"),
  workspaceId: z.string().min(1, "Workspace requis"),
  name: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("Email invalide"),
});

const deleteWorkspaceAdminSchema = z.object({
  membershipId: z.string().min(1, "Admin requis"),
});

const createWorkspaceMemberSchema = z.object({
  workspaceId: z.string().min(1, "Workspace requis"),
  name: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("Email invalide"),
  initialPassword: z
    .string()
    .min(12, "Le mot de passe doit contenir au moins 12 caractères"),
  customRoleId: z.string().optional(),
});

const updateWorkspaceMemberSchema = createWorkspaceMemberSchema
  .omit({ initialPassword: true })
  .extend({
    membershipId: z.string().min(1, "Membre requis"),
  });

const deleteWorkspaceMemberSchema = z.object({
  membershipId: z.string().min(1, "Membre requis"),
});

const workspaceMutationSchema = z.object({
  name: z.string().trim().min(1, "Nom requis"),
});

const updateWorkspaceSchema = workspaceMutationSchema.extend({
  workspaceId: z.string().min(1, "Workspace requis"),
});

const deleteWorkspaceSchema = z.object({
  workspaceId: z.string().min(1, "Workspace requis"),
});

const assignWorkspaceMemberRoleSchema = z.object({
  membershipId: z.string().min(1, "Membre requis"),
  role: z.string().refine(isAssignableWorkspaceRole, "Rôle workspace invalide"),
});

const createWorkspaceCustomRoleSchema = z.object({
  workspaceId: z.string().min(1, "Workspace requis"),
  name: z.string().trim().min(1, "Nom requis"),
  description: z.string().trim().optional(),
  navigation: z
    .array(z.enum(dashboardNavigationPermissions))
    .min(1, "Sélectionnez au moins une vue autorisée"),
});

const updateWorkspaceCustomRoleSchema = createWorkspaceCustomRoleSchema.extend({
  roleId: z.string().min(1, "Rôle requis"),
});

const deleteWorkspaceCustomRoleSchema = z.object({
  roleId: z.string().min(1, "Rôle requis"),
});

const assignWorkspaceMemberCustomRoleSchema = z.object({
  membershipId: z.string().min(1, "Membre requis"),
  roleId: z.string().min(1, "Rôle requis"),
});

export async function createWorkspaceAdminAction(
  input: unknown,
): Promise<ActionResult<WorkspaceAdminCreationResult>> {
  const parsed = createWorkspaceAdminSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La création d'admins requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { createWorkspaceAdmin } = await import("./service");
    const result = await createWorkspaceAdmin({
      actorRole: session.user.role,
      ...parsed.data,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "createWorkspaceAdminAction failed");
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Création de l'admin impossible",
    };
  }
}

export async function updateWorkspaceAdminAction(
  input: unknown,
): Promise<ActionResult<WorkspaceAdminUpdateResult>> {
  const parsed = updateWorkspaceAdminSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La configuration d'admins requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { updateWorkspaceAdmin } = await import("./service");
    const result = await updateWorkspaceAdmin({
      actorRole: session.user.role,
      ...parsed.data,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "updateWorkspaceAdminAction failed");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Configuration de l'admin impossible",
    };
  }
}

export async function deleteWorkspaceAdminAction(
  input: unknown,
): Promise<ActionResult<WorkspaceAdminDeletionResult>> {
  const parsed = deleteWorkspaceAdminSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La suppression d'admins requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { deleteWorkspaceAdmin } = await import("./service");
    const result = await deleteWorkspaceAdmin({
      actorRole: session.user.role,
      ...parsed.data,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "deleteWorkspaceAdminAction failed");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Suppression de l'admin impossible",
    };
  }
}

export async function createWorkspaceMemberAction(
  input: unknown,
): Promise<ActionResult<WorkspaceMemberMutationResult>> {
  const parsed = createWorkspaceMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La création de membres requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { createWorkspaceMember } = await import("./service");
    const result = await createWorkspaceMember({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      ...parsed.data,
      customRoleId: parsed.data.customRoleId || null,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "createWorkspaceMemberAction failed");
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Création du membre impossible",
    };
  }
}

export async function updateWorkspaceMemberAction(
  input: unknown,
): Promise<ActionResult<WorkspaceMemberMutationResult>> {
  const parsed = updateWorkspaceMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La configuration de membres requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { updateWorkspaceMember } = await import("./service");
    const result = await updateWorkspaceMember({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      ...parsed.data,
      customRoleId: parsed.data.customRoleId || null,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "updateWorkspaceMemberAction failed");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Configuration du membre impossible",
    };
  }
}

export async function deleteWorkspaceMemberAction(
  input: unknown,
): Promise<ActionResult<WorkspaceMemberDeletionResult>> {
  const parsed = deleteWorkspaceMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La suppression de membres requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { deleteWorkspaceMember } = await import("./service");
    const result = await deleteWorkspaceMember({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      ...parsed.data,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "deleteWorkspaceMemberAction failed");
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Suppression du membre impossible",
    };
  }
}

export async function createWorkspaceAction(
  input: unknown,
): Promise<ActionResult<WorkspaceMutationResult>> {
  const parsed = workspaceMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La création de workspaces requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { createWorkspace } = await import("./service");
    const result = await createWorkspace({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      name: parsed.data.name,
    });
    revalidatePath("/dashboard");
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "createWorkspaceAction failed");
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Création du workspace impossible",
    };
  }
}

export async function updateWorkspaceAction(
  input: unknown,
): Promise<ActionResult<WorkspaceMutationResult>> {
  const parsed = updateWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La configuration de workspaces requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { updateWorkspaceConfiguration } = await import("./service");
    const result = await updateWorkspaceConfiguration({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
    });
    revalidatePath("/dashboard");
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "updateWorkspaceAction failed");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Configuration du workspace impossible",
    };
  }
}

export async function deleteWorkspaceAction(
  input: unknown,
): Promise<ActionResult<WorkspaceDeletionResult>> {
  const parsed = deleteWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La suppression de workspaces requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { deleteWorkspaceConfiguration } = await import("./service");
    const result = await deleteWorkspaceConfiguration({
      actorRole: session.user.role,
      workspaceId: parsed.data.workspaceId,
    });
    revalidatePath("/dashboard");
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "deleteWorkspaceAction failed");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Suppression du workspace impossible",
    };
  }
}

export async function assignWorkspaceMemberRoleAction(
  input: unknown,
): Promise<ActionResult<WorkspaceRoleAssignmentResult>> {
  const parsed = assignWorkspaceMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();

  try {
    const { assignWorkspaceMemberRole } = await import("./service");
    const result = await assignWorkspaceMemberRole({
      actorUserId: session.user.id,
      ...parsed.data,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "assignWorkspaceMemberRoleAction failed");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Attribution du rôle workspace impossible",
    };
  }
}

export async function createWorkspaceCustomRoleAction(
  input: unknown,
): Promise<ActionResult<WorkspaceCustomRoleCreationResult>> {
  const parsed = createWorkspaceCustomRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La création de rôles requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { createWorkspaceCustomRole } = await import("./service");
    const result = await createWorkspaceCustomRole({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      permissions: { navigation: parsed.data.navigation },
    });
    revalidatePath("/dashboard");
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "createWorkspaceCustomRoleAction failed");
    return {
      success: false,
      error: err instanceof Error ? err.message : "Création du rôle impossible",
    };
  }
}

export async function updateWorkspaceCustomRoleAction(
  input: unknown,
): Promise<ActionResult<WorkspaceCustomRoleUpdateResult>> {
  const parsed = updateWorkspaceCustomRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La configuration de rôles requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { updateWorkspaceCustomRoleConfiguration } =
      await import("./service");
    const result = await updateWorkspaceCustomRoleConfiguration({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      roleId: parsed.data.roleId,
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      permissions: { navigation: parsed.data.navigation },
    });
    revalidatePath("/dashboard");
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "updateWorkspaceCustomRoleAction failed");
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Configuration du rôle impossible",
    };
  }
}

export async function deleteWorkspaceCustomRoleAction(
  input: unknown,
): Promise<ActionResult<{ roleId: string }>> {
  const parsed = deleteWorkspaceCustomRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();
  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "La suppression de rôles requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { deleteWorkspaceCustomRoleConfiguration } =
      await import("./service");
    const result = await deleteWorkspaceCustomRoleConfiguration({
      actorRole: session.user.role,
      roleId: parsed.data.roleId,
    });
    revalidatePath("/dashboard");
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "deleteWorkspaceCustomRoleAction failed");
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Suppression du rôle impossible",
    };
  }
}

export async function assignWorkspaceMemberCustomRoleAction(
  input: unknown,
): Promise<ActionResult<WorkspaceCustomRoleAssignmentResult>> {
  const parsed = assignWorkspaceMemberCustomRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();

  if (!isPlatformRole(session.user.role)) {
    return { success: false, error: "Rôle plateforme invalide" };
  }

  if (!env.DATABASE_URL || env.APP_ENV === "prod") {
    return {
      success: false,
      error:
        "L'attribution de rôles requiert une DB configurée en phase dev ou staging.",
    };
  }

  try {
    const { assignWorkspaceMemberCustomRole } = await import("./service");
    const result = await assignWorkspaceMemberCustomRole({
      actorRole: session.user.role,
      actorUserId: session.user.id,
      ...parsed.data,
    });
    revalidatePath("/administration");
    return { success: true, data: result };
  } catch (err) {
    logger.error({ err }, "assignWorkspaceMemberCustomRoleAction failed");
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Attribution du rôle personnalisé impossible",
    };
  }
}
