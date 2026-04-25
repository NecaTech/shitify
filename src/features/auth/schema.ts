// Re-export Better Auth tables for this feature.
// The source of truth is src/lib/db/auth-schema.ts (generated).
// This file makes the schema accessible at the feature boundary.
export { user, session, account, verification } from "@/lib/db/auth-schema";
