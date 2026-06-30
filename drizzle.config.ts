import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getDatabaseSchemaName } from "./src/lib/db/schema-name";

// Script CLI Node pur — @t3-oss/env-nextjs ne peut pas être importé ici.
// dotenv charge .env.local en priorité sur .env (comportement Next.js).
config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not defined");
const schemaName = getDatabaseSchemaName();

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  schemaFilter: [schemaName],
  dbCredentials: {
    url: databaseUrl,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
