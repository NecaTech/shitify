"use server";

import { z } from "zod";
import { getUserByEmail } from "./service";
import { requireSession } from "@/lib/auth/server";
import type { AuthResult, User } from "./types";

const getUserByEmailSchema = z.object({
  email: z.string().email(),
});

export async function getUserByEmailAction(
  input: unknown,
): Promise<AuthResult<User | null>> {
  await requireSession();

  const parsed = getUserByEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const user = await getUserByEmail(parsed.data.email);
    return { success: true, data: user };
  } catch {
    return { success: false, error: "Internal error" };
  }
}
