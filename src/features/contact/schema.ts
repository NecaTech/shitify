import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";
import { workspace } from "@/features/workspace/schema";

export const contactStatus = pgEnum("contact_status", [
  "new",
  "qualified",
  "archived",
]);

export const contactSubmission = pgTable(
  "contact_submission",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    assignedToId: text("assigned_to_id").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    message: text("message").notNull(),
    status: contactStatus("status").notNull().default("new"),
    source: text("source").notNull().default("website"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("contact_submission_workspace_status_idx").on(
      table.workspaceId,
      table.status,
    ),
    index("contact_submission_email_idx").on(table.email),
  ],
);
