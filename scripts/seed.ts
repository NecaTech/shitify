/**
 * Script de seed — exécuté via `pnpm db:seed` (tsx, pas Next.js).
 *
 * Ce script accède à la DB directement via process.env (comme drizzle.config.ts)
 * car @t3-oss/env-nextjs ne peut pas être importé hors contexte Next.
 * C'est l'exception légale documentée dans AGENT.md.
 *
 * Pré-requis : DATABASE_URL défini dans .env.local
 * Commande   : pnpm db:seed
 */
import { Pool } from "@neondatabase/serverless";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { account, user } from "../src/lib/db/auth-schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not defined");

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.local";
const adminPassword = process.env.ADMIN_PASSWORD ?? "AdminPassword123!";
const adminName = process.env.ADMIN_NAME ?? "Admin";

async function main() {
  const now = new Date();
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, adminEmail))
    .limit(1);

  const userId = existingUser?.id ?? crypto.randomUUID();

  if (existingUser) {
    await db
      .update(user)
      .set({
        name: adminName,
        emailVerified: true,
        updatedAt: now,
      })
      .where(eq(user.id, userId));
  } else {
    await db.insert(user).values({
      id: userId,
      name: adminName,
      email: adminEmail,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const passwordHash = await hashPassword(adminPassword);
  const [existingAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1);

  if (existingAccount) {
    await db
      .update(account)
      .set({
        accountId: userId,
        providerId: "credential",
        password: passwordHash,
        updatedAt: now,
      })
      .where(eq(account.id, existingAccount.id));
  } else {
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  console.info(`[seed] admin ready: ${adminEmail}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  pool.end().finally(() => process.exit(1));
});
