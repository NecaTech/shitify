import { index, integer, jsonb, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";
import { workspace } from "@/features/workspace/schema";
import { appSchema } from "@/lib/db/app-schema";

export const orderStatus = appSchema.enum("order_status", [
  "draft",
  "pending",
  "paid",
  "cancelled",
  "refunded",
]);

export const product = appSchema.table(
  "product",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("product_workspace_idx").on(table.workspaceId)],
);

export const customerOrder = appSchema.table(
  "customer_order",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspace.id, {
      onDelete: "cascade",
    }),
    customerId: text("customer_id").references(() => user.id, {
      onDelete: "set null",
    }),
    customerEmail: text("customer_email").notNull(),
    status: orderStatus("status").notNull().default("draft"),
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    currency: text("currency").notNull().default("EUR"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("customer_order_workspace_status_idx").on(
      table.workspaceId,
      table.status,
    ),
    index("customer_order_customer_email_idx").on(table.customerEmail),
  ],
);

export const orderItem = appSchema.table(
  "order_item",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => customerOrder.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    label: text("label").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPriceCents: integer("unit_price_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [index("order_item_order_idx").on(table.orderId)],
);
