"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { displayNameSchema } from "@/lib/validations/common";
import { requireSession } from "@/lib/auth/server";
import { updateUserProfile } from "./service";
import type { AuthResult, User } from "./types";

const updateProfileSchema = z.object({
  name: displayNameSchema,
});

export async function updateProfileAction(
  input: unknown,
): Promise<AuthResult<User>> {
  const session = await requireSession();

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  try {
    const updated = await updateUserProfile(session.user.id, parsed.data);
    revalidateTag(`user:${session.user.id}`, "default");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Erreur interne" };
  }
}
