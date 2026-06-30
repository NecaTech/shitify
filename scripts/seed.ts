/**
 * Official founder seed, executed via `pnpm db:seed`.
 *
 * The package script loads `.env.local` explicitly and runs the DB safety guard
 * before this file. This script still validates its own required values because
 * it can be invoked directly during local maintenance.
 */
import { Pool as NeonPool } from "@neondatabase/serverless";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool as PgPool } from "pg";
import { account, user } from "../src/lib/db/auth-schema";
import { workspace } from "../src/features/workspace/schema";
import { classifyDatabaseUrl } from "../src/lib/db/database-url";

const CREDENTIAL_PROVIDER_ID = "credential";
const RESET_PASSWORD_VALUE = "true";
const WORKSPACE_SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export type FounderSeedConfig = {
  databaseUrl: string;
  founderEmail: string;
  founderName: string;
  founderInitialPassword: string;
  resetPassword: boolean;
  workspaceName: string;
  workspaceSlug: string;
};

type UserRecord = {
  id: string;
};

type AccountRecord = {
  id: string;
};

type WorkspaceRecord = {
  id: string;
};

export type FounderSeedStore = {
  findUserByEmail(email: string): Promise<UserRecord | undefined>;
  insertFounderUser(values: {
    id: string;
    email: string;
    name: string;
    now: Date;
  }): Promise<void>;
  updateFounderUser(values: {
    id: string;
    email: string;
    name: string;
    now: Date;
  }): Promise<void>;
  findCredentialAccount(userId: string): Promise<AccountRecord | undefined>;
  insertCredentialAccount(values: {
    id: string;
    userId: string;
    passwordHash: string;
    now: Date;
  }): Promise<void>;
  updateCredentialAccount(values: {
    id: string;
    userId: string;
    passwordHash?: string;
    now: Date;
  }): Promise<void>;
  findWorkspaceBySlug(slug: string): Promise<WorkspaceRecord | undefined>;
  insertInitialWorkspace(values: {
    id: string;
    name: string;
    slug: string;
    now: Date;
  }): Promise<void>;
  updateInitialWorkspace(values: {
    id: string;
    name: string;
    slug: string;
    now: Date;
  }): Promise<void>;
  close(): Promise<void>;
};

export type FounderSeedResult = {
  founderEmail: string;
  founderCreated: boolean;
  credentialCreated: boolean;
  passwordReset: boolean;
  workspaceSlug: string;
  workspaceName: string;
  workspaceCreated: boolean;
};

function requiredEnv(env: Record<string, string | undefined>, name: string) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function optionalEnv(env: Record<string, string | undefined>, name: string) {
  const value = env[name]?.trim();
  return value || undefined;
}

function titleFromSlug(slug: string | undefined) {
  if (!slug) return undefined;

  const words = slug
    .split(/[-_]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) return undefined;

  return words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function workspaceSlugFromProjectSlug(projectSlug: string | undefined) {
  return projectSlug?.trim().replace(/_/g, "-") || undefined;
}

function validateWorkspaceSlug(slug: string) {
  if (!WORKSPACE_SLUG_PATTERN.test(slug)) {
    throw new Error(
      "INITIAL_WORKSPACE_SLUG must start with a lowercase letter or number and contain only lowercase letters, numbers, underscores, or hyphens",
    );
  }
}

export function readFounderSeedConfig(
  env: Record<string, string | undefined> = process.env,
): FounderSeedConfig {
  const founderEmail = requiredEnv(env, "FOUNDER_EMAIL").toLowerCase();
  const founderName = requiredEnv(env, "FOUNDER_NAME");
  const founderInitialPassword = requiredEnv(env, "FOUNDER_INITIAL_PASSWORD");
  const workspaceSlug =
    optionalEnv(env, "INITIAL_WORKSPACE_SLUG") ??
    workspaceSlugFromProjectSlug(optionalEnv(env, "PROJECT_SLUG")) ??
    "initial-workspace";
  const workspaceName =
    optionalEnv(env, "INITIAL_WORKSPACE_NAME") ??
    titleFromSlug(optionalEnv(env, "PROJECT_SLUG")) ??
    "Initial Workspace";

  validateWorkspaceSlug(workspaceSlug);

  return {
    databaseUrl: requiredEnv(env, "DATABASE_URL"),
    founderEmail,
    founderName,
    founderInitialPassword,
    resetPassword:
      optionalEnv(env, "FOUNDER_RESET_PASSWORD") === RESET_PASSWORD_VALUE,
    workspaceName,
    workspaceSlug,
  };
}

export async function seedFounderAndInitialWorkspace({
  config,
  store,
  passwordHasher = hashPassword,
  now = new Date(),
  createId = randomUUID,
}: {
  config: FounderSeedConfig;
  store: FounderSeedStore;
  passwordHasher?: (password: string) => Promise<string>;
  now?: Date;
  createId?: () => string;
}): Promise<FounderSeedResult> {
  const existingUser = await store.findUserByEmail(config.founderEmail);
  const userId = existingUser?.id ?? createId();
  const founderCreated = !existingUser;

  if (existingUser) {
    await store.updateFounderUser({
      id: userId,
      email: config.founderEmail,
      name: config.founderName,
      now,
    });
  } else {
    await store.insertFounderUser({
      id: userId,
      email: config.founderEmail,
      name: config.founderName,
      now,
    });
  }

  const existingAccount = await store.findCredentialAccount(userId);
  const shouldWritePassword = !existingAccount || config.resetPassword;
  const passwordHash = shouldWritePassword
    ? await passwordHasher(config.founderInitialPassword)
    : undefined;

  if (existingAccount) {
    const credentialUpdate: {
      id: string;
      userId: string;
      passwordHash?: string;
      now: Date;
    } = {
      id: existingAccount.id,
      userId,
      now,
    };

    if (passwordHash) credentialUpdate.passwordHash = passwordHash;

    await store.updateCredentialAccount(credentialUpdate);
  } else {
    if (!passwordHash) {
      throw new Error("Password hash is required for a new credential account");
    }

    await store.insertCredentialAccount({
      id: createId(),
      userId,
      passwordHash,
      now,
    });
  }

  const existingWorkspace = await store.findWorkspaceBySlug(
    config.workspaceSlug,
  );
  const workspaceCreated = !existingWorkspace;

  if (existingWorkspace) {
    await store.updateInitialWorkspace({
      id: existingWorkspace.id,
      name: config.workspaceName,
      slug: config.workspaceSlug,
      now,
    });
  } else {
    await store.insertInitialWorkspace({
      id: createId(),
      name: config.workspaceName,
      slug: config.workspaceSlug,
      now,
    });
  }

  return {
    founderEmail: config.founderEmail,
    founderCreated,
    credentialCreated: !existingAccount,
    passwordReset: Boolean(existingAccount && config.resetPassword),
    workspaceSlug: config.workspaceSlug,
    workspaceName: config.workspaceName,
    workspaceCreated,
  };
}

function createDrizzleSeedStore(databaseUrl: string): FounderSeedStore {
  const databaseKind = classifyDatabaseUrl(new URL(databaseUrl));
  const pool =
    databaseKind === "local"
      ? new PgPool({ connectionString: databaseUrl })
      : new NeonPool({ connectionString: databaseUrl });
  const db =
    databaseKind === "local"
      ? drizzlePg(pool as PgPool)
      : drizzleNeon(pool as NeonPool);

  return {
    async findUserByEmail(email) {
      const [record] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      return record;
    },
    async insertFounderUser(values) {
      await db.insert(user).values({
        id: values.id,
        name: values.name,
        email: values.email,
        emailVerified: true,
        role: "founder",
        createdAt: values.now,
        updatedAt: values.now,
      });
    },
    async updateFounderUser(values) {
      await db
        .update(user)
        .set({
          name: values.name,
          email: values.email,
          emailVerified: true,
          role: "founder",
          updatedAt: values.now,
        })
        .where(eq(user.id, values.id));
    },
    async findCredentialAccount(userId) {
      const [record] = await db
        .select({ id: account.id })
        .from(account)
        .where(
          and(
            eq(account.userId, userId),
            eq(account.providerId, CREDENTIAL_PROVIDER_ID),
          ),
        )
        .limit(1);
      return record;
    },
    async insertCredentialAccount(values) {
      await db.insert(account).values({
        id: values.id,
        accountId: values.userId,
        providerId: CREDENTIAL_PROVIDER_ID,
        userId: values.userId,
        password: values.passwordHash,
        createdAt: values.now,
        updatedAt: values.now,
      });
    },
    async updateCredentialAccount(values) {
      await db
        .update(account)
        .set({
          accountId: values.userId,
          providerId: CREDENTIAL_PROVIDER_ID,
          ...(values.passwordHash ? { password: values.passwordHash } : {}),
          updatedAt: values.now,
        })
        .where(eq(account.id, values.id));
    },
    async findWorkspaceBySlug(slug) {
      const [record] = await db
        .select({ id: workspace.id })
        .from(workspace)
        .where(eq(workspace.slug, slug))
        .limit(1);
      return record;
    },
    async insertInitialWorkspace(values) {
      await db.insert(workspace).values({
        id: values.id,
        name: values.name,
        slug: values.slug,
        createdById: null,
        createdAt: values.now,
        updatedAt: values.now,
      });
    },
    async updateInitialWorkspace(values) {
      await db
        .update(workspace)
        .set({
          name: values.name,
          slug: values.slug,
          updatedAt: values.now,
        })
        .where(eq(workspace.id, values.id));
    },
    async close() {
      await pool.end();
    },
  };
}

function logSeedResult(result: FounderSeedResult) {
  console.info(
    [
      `[seed] founder ${result.founderCreated ? "created" : "updated"}: ${result.founderEmail}`,
      `[seed] credential ${result.credentialCreated ? "created" : result.passwordReset ? "password reset" : "preserved"}`,
      `[seed] workspace ${result.workspaceCreated ? "created" : "updated"}: ${result.workspaceSlug} (${result.workspaceName})`,
    ].join("\n"),
  );
}

export async function main() {
  const config = readFounderSeedConfig();
  const store = createDrizzleSeedStore(config.databaseUrl);

  try {
    const result = await seedFounderAndInitialWorkspace({ config, store });
    logSeedResult(result);
  } finally {
    await store.close();
  }
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? resolve(process.argv[1]) : "";

if (currentFile === invokedFile) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
