import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

// BETTER_AUTH_URL est obligatoire et toujours correct (serveur).
// Ne pas utiliser NEXT_PUBLIC_APP_URL ici : variable optionnelle avec default localhost,
// ce qui casserait l'auth en prod si la variable client n'est pas configurée.
const trustedOrigins = [env.BETTER_AUTH_URL];
if (process.env.VERCEL_URL) {
  trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

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
