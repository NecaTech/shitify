import "server-only";
import { logger } from "@/lib/logger";
import { findUserByEmail, findUserById, updateUser } from "./repository";
import type { User } from "./types";

export async function getUserById(id: string): Promise<User | null> {
  return findUserById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return findUserByEmail(email);
}

export async function updateUserProfile(
  id: string,
  data: { name: string },
): Promise<User> {
  const existing = await findUserById(id);
  if (!existing) throw new Error(`User ${id} not found`);

  const updated = await updateUser(id, { name: data.name.trim() });
  if (!updated) throw new Error(`Failed to update user ${id}`);

  logger.info({ userId: id }, "user profile updated");
  return updated;
}
