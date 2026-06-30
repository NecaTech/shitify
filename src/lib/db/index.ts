import "server-only";
import { Pool as NeonPool } from "@neondatabase/serverless";
import {
  drizzle as drizzleNeon,
  type NeonDatabase,
} from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";
import { env } from "@/lib/env";
import { classifyDatabaseUrl } from "./database-url";
import * as schema from "./schema";

type AppDatabase =
  | ReturnType<typeof drizzlePg<typeof schema>>
  | NeonDatabase<typeof schema>;
type AppPool = PgPool | NeonPool;

// singleton — évite de recréer pool ET db à chaque hot-reload Next dev
const globalForDb = globalThis as unknown as {
  pool?: AppPool;
  db?: AppDatabase;
};

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required before importing @/lib/db");
}

const databaseUrl = new URL(env.DATABASE_URL);
const databaseKind = classifyDatabaseUrl(databaseUrl);
const pool =
  globalForDb.pool ??
  (databaseKind === "local"
    ? new PgPool({ connectionString: env.DATABASE_URL })
    : new NeonPool({ connectionString: env.DATABASE_URL }));

export const db: AppDatabase =
  globalForDb.db ??
  (databaseKind === "local"
    ? drizzlePg(pool as PgPool, { schema })
    : drizzleNeon(pool as NeonPool, { schema }));

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.db = db;
}
