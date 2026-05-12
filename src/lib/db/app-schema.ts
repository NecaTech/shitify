import { pgSchema } from "drizzle-orm/pg-core";
import { getDatabaseSchemaName } from "./schema-name";

export const appSchema = pgSchema(getDatabaseSchemaName());
