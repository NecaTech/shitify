import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  resource,
  resourceField,
  resourceRecord,
} from "@/features/crud/schema";
import { resourcesTag, resourceTag, resourceRecordsTag } from "./cache";
import type {
  Resource,
  ResourceWithFields,
  ResourceField,
  ResourceRecord,
} from "./types";

export async function listResources(): Promise<Resource[]> {
  "use cache";
  cacheTag(resourcesTag);
  cacheLife("hours");
  return db.select().from(resource).orderBy(asc(resource.name));
}

export async function findResourceWithFields(
  id: string,
): Promise<ResourceWithFields | null> {
  "use cache";
  cacheTag(resourceTag(id));
  cacheLife("hours");
  const [entity] = await db
    .select()
    .from(resource)
    .where(eq(resource.id, id))
    .limit(1);
  if (!entity) return null;

  const fields = await db
    .select()
    .from(resourceField)
    .where(eq(resourceField.entityId, id))
    .orderBy(asc(resourceField.sortOrder), asc(resourceField.label));

  return { ...entity, fields };
}

export async function createResource(
  data: typeof resource.$inferInsert,
): Promise<Resource | null> {
  const [row] = await db.insert(resource).values(data).returning();
  return row ?? null;
}

export async function deleteResource(id: string): Promise<Resource | null> {
  const [row] = await db
    .delete(resource)
    .where(eq(resource.id, id))
    .returning();
  return row ?? null;
}

export async function createResourceField(
  data: typeof resourceField.$inferInsert,
): Promise<ResourceField | null> {
  const [row] = await db.insert(resourceField).values(data).returning();
  return row ?? null;
}

export async function deleteResourceField(
  id: string,
): Promise<ResourceField | null> {
  const [row] = await db
    .delete(resourceField)
    .where(eq(resourceField.id, id))
    .returning();
  return row ?? null;
}

export async function listResourceRecords(
  entityId: string,
): Promise<ResourceRecord[]> {
  "use cache";
  cacheTag(resourceRecordsTag(entityId));
  cacheLife("hours");
  return db
    .select()
    .from(resourceRecord)
    .where(eq(resourceRecord.entityId, entityId))
    .orderBy(asc(resourceRecord.createdAt));
}

export async function createResourceRecord(
  data: typeof resourceRecord.$inferInsert,
): Promise<ResourceRecord | null> {
  const [row] = await db.insert(resourceRecord).values(data).returning();
  return row ?? null;
}

export async function updateResourceRecord(
  id: string,
  data: Partial<Pick<ResourceRecord, "data" | "updatedById">>,
): Promise<ResourceRecord | null> {
  const [row] = await db
    .update(resourceRecord)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(resourceRecord.id, id))
    .returning();
  return row ?? null;
}

export async function deleteResourceRecord(
  id: string,
): Promise<ResourceRecord | null> {
  const [row] = await db
    .delete(resourceRecord)
    .where(eq(resourceRecord.id, id))
    .returning();
  return row ?? null;
}
