import "server-only";
import {
  createResource,
  createResourceField,
  createResourceRecord,
  deleteResource,
  deleteResourceField,
  deleteResourceRecord,
  findResourceWithFields,
  listResources,
  listResourceRecords,
  updateResourceRecord,
} from "./repository";
import type {
  Resource,
  ResourceWithFields,
  ResourceField,
  ResourceRecord,
} from "./types";

export function slugifyField(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

export async function getResources(): Promise<Resource[]> {
  return listResources();
}

export async function getResourceWithFields(
  id: string,
): Promise<ResourceWithFields | null> {
  return findResourceWithFields(id);
}

export async function addResource(data: {
  name: string;
  description?: string | null;
  createdById: string;
}): Promise<Resource> {
  const created = await createResource({
    id: crypto.randomUUID(),
    name: data.name.trim(),
    slug: slugifyField(data.name),
    description: data.description?.trim() || null,
    createdById: data.createdById,
  });
  if (!created) throw new Error("Failed to create resource");
  return created;
}

export async function removeResource(id: string): Promise<Resource> {
  const deleted = await deleteResource(id);
  if (!deleted) throw new Error(`Resource ${id} not found`);
  return deleted;
}

export async function addResourceField(data: {
  entityId: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "date"
    | "email"
    | "url"
    | "select";
  isRequired: boolean;
}): Promise<ResourceField> {
  const entity = await findResourceWithFields(data.entityId);
  if (!entity) throw new Error(`Resource ${data.entityId} not found`);

  const created = await createResourceField({
    id: crypto.randomUUID(),
    entityId: data.entityId,
    label: data.label.trim(),
    key: slugifyField(data.label),
    type: data.type,
    isRequired: data.isRequired,
    sortOrder: entity.fields.length,
  });
  if (!created) throw new Error("Failed to create resource field");
  return created;
}

export async function removeResourceField(id: string): Promise<ResourceField> {
  const deleted = await deleteResourceField(id);
  if (!deleted) throw new Error(`Resource field ${id} not found`);
  return deleted;
}

export async function getResourceRecords(
  entityId: string,
): Promise<ResourceRecord[]> {
  return listResourceRecords(entityId);
}

export async function addResourceRecord(data: {
  entityId: string;
  values: Record<string, unknown>;
  userId: string;
}): Promise<ResourceRecord> {
  const entity = await findResourceWithFields(data.entityId);
  if (!entity) throw new Error(`Resource ${data.entityId} not found`);

  const created = await createResourceRecord({
    id: crypto.randomUUID(),
    entityId: data.entityId,
    data: normalizeRecordValues(entity, data.values),
    createdById: data.userId,
    updatedById: data.userId,
  });
  if (!created) throw new Error("Failed to create resource record");
  return created;
}

export async function editResourceRecord(data: {
  id: string;
  entityId: string;
  values: Record<string, unknown>;
  userId: string;
}): Promise<ResourceRecord> {
  const entity = await findResourceWithFields(data.entityId);
  if (!entity) throw new Error(`Resource ${data.entityId} not found`);

  const updated = await updateResourceRecord(data.id, {
    data: normalizeRecordValues(entity, data.values),
    updatedById: data.userId,
  });
  if (!updated) throw new Error(`Resource record ${data.id} not found`);
  return updated;
}

export async function removeResourceRecord(
  id: string,
): Promise<ResourceRecord> {
  const deleted = await deleteResourceRecord(id);
  if (!deleted) throw new Error(`Resource record ${id} not found`);
  return deleted;
}

function normalizeRecordValues(
  entity: ResourceWithFields,
  values: Record<string, unknown>,
) {
  return Object.fromEntries(
    entity.fields.map((field) => [field.key, values[field.key] ?? ""]),
  );
}
