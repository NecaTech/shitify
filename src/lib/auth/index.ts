import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

function toOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`)
      .origin;
  } catch {
    return null;
  }
}

const trustedOrigins = [
  toOrigin(env.BETTER_AUTH_URL),
  toOrigin(env.NEXT_PUBLIC_APP_URL),
  toOrigin(process.env.VERCEL_URL),
  toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  process.env.NODE_ENV !== "production" ? "http://localhost:3000" : null,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: false, // set to true when email provider is configured
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    // TODO(init-project): storage: "database" requiert que la table `rateLimit` soit présente
    // dans le schema généré. Lancer `npx @better-auth/cli generate` puis `pnpm db:generate`.
    storage: "database",
    // Stricter limits on sensitive auth endpoints
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/forget-password": { window: 60, max: 3 },
    },
  },
});
