import { index, integer, jsonb, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";
import { workspace } from "@/features/workspace/schema";
import { appSchema } from "@/lib/db/app-schema";

export const bookingStatus = appSchema.enum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const booking = appSchema.table(
  "booking",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    customerId: text("customer_id").references(() => user.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    status: bookingStatus("status").notNull().default("pending"),
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("booking_workspace_starts_idx").on(table.workspaceId, table.startsAt),
    index("booking_customer_email_idx").on(table.customerEmail),
  ],
);
