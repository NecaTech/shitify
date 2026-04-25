"use server";

import { z } from "zod";
import { getUserByEmail } from "./service";
import type { AuthResult, User } from "./types";

const getUserByEmailSchema = z.object({
  email: z.string().email(),
});

export async function getUserByEmailAction(
  input: unknown,
): Promise<AuthResult<User | null>> {
  const parsed = getUserByEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const user = await getUserByEmail(parsed.data.email);
  return { success: true, data: user };
}
