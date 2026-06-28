import "server-only";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

// singleton — évite de recréer pool ET db à chaque hot-reload Next dev
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: NeonDatabase<typeof schema>;
};

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required before importing @/lib/db");
}

const pool =
  globalForDb.pool ?? new Pool({ connectionString: env.DATABASE_URL });

export const db: NeonDatabase<typeof schema> =
  globalForDb.db ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.db = db;
}
