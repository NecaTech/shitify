import {
  boolean,
  index,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";
import { appSchema } from "@/lib/db/app-schema";

export const membershipRole = appSchema.enum("membership_role", [
  "owner",
  "admin",
  "member",
]);

export const workspace = appSchema.table(
  "workspace",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoUrl: text("logo_url"),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("workspace_slug_idx").on(table.slug)],
);

export const workspaceMembership = appSchema.table(
  "workspace_membership",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: membershipRole("role").notNull().default("member"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("workspace_membership_workspace_user_idx").on(
      table.workspaceId,
      table.userId,
    ),
    index("workspace_membership_user_idx").on(table.userId),
  ],
);

export const workspaceCustomRole = appSchema.table(
  "workspace_custom_role",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    permissions: jsonb("permissions").notNull(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("workspace_custom_role_workspace_slug_idx").on(
      table.workspaceId,
      table.slug,
    ),
    index("workspace_custom_role_workspace_idx").on(table.workspaceId),
  ],
);

export const workspaceMembershipCustomRole = appSchema.table(
  "workspace_membership_custom_role",
  {
    membershipId: text("membership_id")
      .primaryKey()
      .references(() => workspaceMembership.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => workspaceCustomRole.id, { onDelete: "cascade" }),
    assignedById: text("assigned_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => [
    index("workspace_membership_custom_role_role_idx").on(table.roleId),
  ],
);
