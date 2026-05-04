import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { workspace } from "@/features/workspace/schema";
import { user } from "@/lib/db/auth-schema";

export const resourceFieldType = pgEnum("resource_field_type", [
  "text",
  "textarea",
  "number",
  "boolean",
  "date",
  "email",
  "url",
  "select",
]);

export const resource = pgTable(
  "resource",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(false),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("resource_workspace_slug_idx").on(
      table.workspaceId,
      table.slug,
    ),
    index("resource_workspace_idx").on(table.workspaceId),
  ],
);

export const resourceField = pgTable(
  "resource_field",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .notNull()
      .references(() => resource.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    key: text("key").notNull(),
    type: resourceFieldType("type").notNull().default("text"),
    isRequired: boolean("is_required").notNull().default(false),
    isListVisible: boolean("is_list_visible").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    options: jsonb("options").$type<string[]>().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("resource_field_entity_key_idx").on(table.entityId, table.key),
    index("resource_field_entity_idx").on(table.entityId),
  ],
);

export const resourceRecord = pgTable(
  "resource_record",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id")
      .notNull()
      .references(() => resource.id, { onDelete: "cascade" }),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("resource_record_entity_idx").on(table.entityId)],
);
