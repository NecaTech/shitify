import type { user } from "./schema";
import type { InferSelectModel } from "drizzle-orm";
import type { ActionResult } from "@/types/result";

export type User = InferSelectModel<typeof user>;

// Re-export for convenience within the auth feature
export type { ActionResult };

/** @deprecated Use ActionResult from @/types/result instead */
export type AuthResult<T = void> = ActionResult<T>;
