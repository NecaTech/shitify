"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { displayNameSchema } from "@/lib/validations/common";
import {
  clearLocalAuthSession,
  createLocalAuthSession,
  isLocalAuthEnabled,
} from "@/lib/auth/local";
import { requireSession } from "@/lib/auth/server";
import { updateUserProfile } from "./service";
import { userTag } from "./cache";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types/result";
import type { User } from "./types";

const updateProfileSchema = z.object({
  name: displayNameSchema,
});

const localLoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  redirectTo: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        (value.startsWith("/") &&
          !value.startsWith("//") &&
          !value.includes("://")),
      "Redirection invalide",
    ),
});

export async function localLoginAction(
  input: unknown,
): Promise<ActionResult<never>> {
  if (!isLocalAuthEnabled()) {
    return { success: false, error: "Connexion locale indisponible" };
  }

  const parsed = localLoginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const authenticated = await createLocalAuthSession(parsed.data);
  if (!authenticated) {
    return { success: false, error: "Identifiants invalides" };
  }

  redirect(parsed.data.redirectTo || "/dashboard");
}

export async function localLogoutAction() {
  await clearLocalAuthSession();
}

export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult<User>> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const session = await requireSession();

  try {
    const updated = await updateUserProfile(session.user.id, parsed.data);
    revalidateTag(userTag(session.user.id), "max");
    return { success: true, data: updated };
  } catch (err) {
    logger.error(
      { err, userId: session.user.id },
      "updateProfileAction failed",
    );
    return { success: false, error: "Erreur interne" };
  }
}
