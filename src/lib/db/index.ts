import "server-only";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { env } from "@/lib/env";
import * as schema from "./schema";

// singleton — globalThis ne connaît pas Pool, cast requis pour le hot-reload Next dev
const globalForDb = globalThis as unknown as { pool?: Pool };
const pool =
  globalForDb.pool ?? new Pool({ connectionString: env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
