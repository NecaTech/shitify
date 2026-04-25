/**
 * Script de seed — exécuté via `pnpm db:seed` (tsx, pas Next.js).
 *
 * Ce script accède à la DB directement via process.env (comme drizzle.config.ts)
 * car @t3-oss/env-nextjs ne peut pas être importé hors contexte Next.
 * C'est l'exception légale documentée dans CLAUDE.md.
 *
 * Pré-requis : DATABASE_URL défini dans .env.local
 * Commande   : pnpm db:seed
 */
import "dotenv/config";
import { Pool } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-serverless";
// import * as schema from "../src/lib/db/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not defined");

const pool = new Pool({ connectionString: databaseUrl });
// const db = drizzle(pool, { schema }); // décommenter quand des tables existent

async function main() {
  // Exemple : insérer des données initiales
  // await db.insert(schema.users).values([
  //   { id: crypto.randomUUID(), name: "Admin", email: "admin@example.com" },
  // ]);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  pool.end().finally(() => process.exit(1));
});
