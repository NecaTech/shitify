"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isPlatformRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { isAssignableWorkspaceRole } from "./roles";
import type { ActionResult } from "@/types/result";
import type {
  WorkspaceAdminCreationResult,
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

const assignWorkspaceMemberRoleSchema = z.object({
  membershipId: z.string().min(1, "Membre requis"),
  role: z.string().refine(isAssignableWorkspaceRole, "Rôle workspace invalide"),
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

  if (env.APP_ENV !== "staging" || !env.DATABASE_URL) {
    return {
      success: false,
      error: "La création d'admins requiert la phase staging avec une DB Neon.",
    };
  }

  try {
    const { createWorkspaceAdmin } = await import("./service");
    const result = await createWorkspaceAdmin({
      actorRole: session.user.role,
      ...parsed.data,
    });
    revalidatePath("/dashboard/administration");
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
    revalidatePath("/dashboard/administration");
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
