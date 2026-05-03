"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { displayNameSchema } from "@/lib/validations/common";
import { requireSession } from "@/lib/auth/server";
import { updateUserProfile } from "./service";
import { userTag } from "./repository";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types/result";
import type { User } from "./types";

const updateProfileSchema = z.object({
  name: displayNameSchema,
});

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
