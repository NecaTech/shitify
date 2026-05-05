"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth/server";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types/result";
import {
  addResource,
  addResourceField,
  addResourceRecord,
  editResourceRecord,
  removeResource,
  removeResourceField,
  removeResourceRecord,
} from "./service";
import { resourcesTag, resourceTag, resourceRecordsTag } from "./cache";

const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "number",
  "boolean",
  "date",
  "email",
  "url",
  "select",
]);

const entitySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional(),
});

const fieldSchema = z.object({
  entityId: z.string().min(1),
  label: z.string().min(2).max(80),
  type: fieldTypeSchema,
  isRequired: z.boolean().default(false),
});

const recordSchema = z.object({
  entityId: z.string().min(1),
  values: z.record(z.string(), z.unknown()),
});

const editRecordSchema = recordSchema.extend({
  id: z.string().min(1),
});

const idSchema = z.object({
  id: z.string().min(1),
  entityId: z.string().optional(),
});

export async function createResourceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = entitySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Entité invalide" };

  const session = await requireSession();
  try {
    const entity = await addResource({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      createdById: session.user.id,
    });
    revalidateTag(resourcesTag, "max");
    return { success: true, data: { id: entity.id } };
  } catch (err) {
    logger.error({ err }, "createResourceAction failed");
    return { success: false, error: "Erreur interne" };
  }
}

export async function deleteResourceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Entité invalide" };

  await requireSession();
  try {
    await removeResource(parsed.data.id);
    revalidateTag(resourcesTag, "max");
    revalidateTag(resourceTag(parsed.data.id), "max");
    return { success: true, data: { id: parsed.data.id } };
  } catch (err) {
    logger.error({ err }, "deleteResourceAction failed");
    return { success: false, error: "Erreur interne" };
  }
}

export async function createResourceFieldAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = fieldSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Champ invalide" };

  await requireSession();
  try {
    const field = await addResourceField(parsed.data);
    revalidateTag(resourceTag(parsed.data.entityId), "max");
    return { success: true, data: { id: field.id } };
  } catch (err) {
    logger.error({ err }, "createResourceFieldAction failed");
    return { success: false, error: "Erreur interne" };
  }
}

export async function deleteResourceFieldAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Champ invalide" };

  await requireSession();
  try {
    await removeResourceField(parsed.data.id);
    if (parsed.data.entityId)
      revalidateTag(resourceTag(parsed.data.entityId), "max");
    return { success: true, data: { id: parsed.data.id } };
  } catch (err) {
    logger.error({ err }, "deleteResourceFieldAction failed");
    return { success: false, error: "Erreur interne" };
  }
}

export async function createResourceRecordAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = recordSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: "Enregistrement invalide" };

  const session = await requireSession();
  try {
    const record = await addResourceRecord({
      ...parsed.data,
      userId: session.user.id,
    });
    revalidateTag(resourceRecordsTag(parsed.data.entityId), "max");
    return { success: true, data: { id: record.id } };
  } catch (err) {
    logger.error({ err }, "createResourceRecordAction failed");
    return { success: false, error: "Erreur interne" };
  }
}

export async function updateResourceRecordAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = editRecordSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: "Enregistrement invalide" };

  const session = await requireSession();
  try {
    await editResourceRecord({ ...parsed.data, userId: session.user.id });
    revalidateTag(resourceRecordsTag(parsed.data.entityId), "max");
    return { success: true, data: { id: parsed.data.id } };
  } catch (err) {
    logger.error({ err }, "updateResourceRecordAction failed");
    return { success: false, error: "Erreur interne" };
  }
}

export async function deleteResourceRecordAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: "Enregistrement invalide" };

  await requireSession();
  try {
    await removeResourceRecord(parsed.data.id);
    if (parsed.data.entityId)
      revalidateTag(resourceRecordsTag(parsed.data.entityId), "max");
    return { success: true, data: { id: parsed.data.id } };
  } catch (err) {
    logger.error({ err }, "deleteResourceRecordAction failed");
    return { success: false, error: "Erreur interne" };
  }
}
