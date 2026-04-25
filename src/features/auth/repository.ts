import "server-only";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "./schema";
import type { User } from "./types";

export async function findUserById(id: string): Promise<User | null> {
  "use cache";
  cacheTag(`user:${id}`);
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return row ?? null;
}

// Pas de 'use cache' : Better Auth appelle directement la DB via son adapter
// Drizzle en bypassant ce repository — le cache ne serait jamais invalidé.
export async function findUserByEmail(email: string): Promise<User | null> {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "name">>,
): Promise<User | null> {
  const [row] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning();
  return row ?? null;
}
