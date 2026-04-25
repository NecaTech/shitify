import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "./schema";
import type { User } from "./types";

export async function findUserById(id: string): Promise<User | null> {
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return row ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return row ?? null;
}
