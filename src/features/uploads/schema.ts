import { index, integer, jsonb, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";
import { workspace } from "@/features/workspace/schema";
import { appSchema } from "@/lib/db/app-schema";

export const uploadVisibility = appSchema.enum("upload_visibility", [
  "private",
  "workspace",
  "public",
]);

export const uploadedFile = appSchema.table(
  "uploaded_file",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    storageKey: text("storage_key").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    visibility: uploadVisibility("visibility").notNull().default("private"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("uploaded_file_workspace_idx").on(table.workspaceId),
    index("uploaded_file_owner_idx").on(table.ownerId),
  ],
);
