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
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? vercelAppUrl,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? vercelAppUrl,
  },
});
