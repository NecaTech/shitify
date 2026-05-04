import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";
import { workspace } from "@/features/workspace/schema";

export const notificationType = pgEnum("notification_type", [
  "info",
  "success",
  "warning",
  "error",
]);

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull().default("info"),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notification_user_read_idx").on(table.userId, table.isRead),
    index("notification_workspace_idx").on(table.workspaceId),
  ],
);
