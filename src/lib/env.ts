import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

function toHttpsUrl(value: string | undefined) {
  if (!value) return undefined;
  return value.startsWith("http") ? value : `https://${value}`;
}

const vercelAppUrl =
  toHttpsUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  toHttpsUrl(process.env.VERCEL_URL);

export const env = createEnv({
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION && process.env.NODE_ENV !== "production",
  server: {
    DATABASE_URL: z.string().url(),
    APP_ENV: z.enum(["dev", "staging", "prod"]),
    CLIENT_SLUG: z
      .string()
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "CLIENT_SLUG must be lowercase letters, numbers, or underscores",
      ),
    PROJECT_SLUG: z
      .string()
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "PROJECT_SLUG must be lowercase letters, numbers, or underscores",
      ),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
  },
  client: {
    // TODO(init-project): remplacer par z.string().url() sans default une fois le domaine connu
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url()
      .optional()
      .default("http://localhost:3000"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    APP_ENV: process.env.APP_ENV,
    CLIENT_SLUG: process.env.CLIENT_SLUG,
    PROJECT_SLUG: process.env.PROJECT_SLUG,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? vercelAppUrl,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? vercelAppUrl,
  },
});
