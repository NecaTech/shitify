import type { user } from "./schema";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof user>;
