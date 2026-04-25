import type { user } from "./schema";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof user>;

export type AuthResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
