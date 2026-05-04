import type {
  resource,
  resourceField,
  resourceRecord,
} from "@/features/crud/schema";

export type Resource = typeof resource.$inferSelect;
export type ResourceField = typeof resourceField.$inferSelect;
export type ResourceRecord = typeof resourceRecord.$inferSelect;

export type ResourceWithFields = Resource & {
  fields: ResourceField[];
};
