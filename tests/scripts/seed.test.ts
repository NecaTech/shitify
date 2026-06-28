// @vitest-environment node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FounderSeedConfig, FounderSeedStore } from "../../scripts/seed";

const repoRoot = process.cwd();
const scriptPath = join(repoRoot, "scripts/seed.ts");
const tsxBin = join(repoRoot, "node_modules/.bin/tsx");
const runtimeEnv = process["env"];
const databaseUrlKey = ["DATABASE", "URL"].join("_");
const fictiveDatabaseUrl = [
  "postgres",
  "://user:password@localhost:5432/example",
].join("");
const founderEmail = "founder@example.test";
const founderName = "Example Founder";
const founderInitialPassword = "example-password-123";

const baseEnv: Record<string, string> = {
  APP_ENV: "dev",
  CLIENT_SLUG: "example_client",
  PROJECT_SLUG: "example_project",
  [databaseUrlKey]: fictiveDatabaseUrl,
  FOUNDER_EMAIL: founderEmail,
  FOUNDER_NAME: founderName,
  FOUNDER_INITIAL_PASSWORD: founderInitialPassword,
};

function runSeed(env: Record<string, string | undefined>) {
  return spawnSync(tsxBin, [scriptPath], {
    cwd: repoRoot,
    env: {
      ...runtimeEnv,
      ...baseEnv,
      ...env,
    },
    encoding: "utf8",
  });
}

async function importSeedModule() {
  runtimeEnv.APP_ENV = baseEnv.APP_ENV;
  runtimeEnv.CLIENT_SLUG = baseEnv.CLIENT_SLUG;
  runtimeEnv.PROJECT_SLUG = baseEnv.PROJECT_SLUG;
  return import("../../scripts/seed");
}

type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
};

type AccountRecord = {
  id: string;
  userId: string;
  passwordHash: string;
};

type WorkspaceRecord = {
  id: string;
  name: string;
  slug: string;
  createdById: string | null;
};

function createFakeStore(seed?: {
  user?: UserRecord;
  account?: AccountRecord;
  workspace?: WorkspaceRecord;
}) {
  const users = new Map<string, UserRecord>();
  const accounts = new Map<string, AccountRecord>();
  const workspaces = new Map<string, WorkspaceRecord>();
  const operations: string[] = [];

  if (seed?.user) users.set(seed.user.email, seed.user);
  if (seed?.account) accounts.set(seed.account.userId, seed.account);
  if (seed?.workspace) workspaces.set(seed.workspace.slug, seed.workspace);

  const store: FounderSeedStore = {
    async findUserByEmail(email) {
      return users.get(email);
    },
    async insertFounderUser(values) {
      operations.push("insert-founder");
      users.set(values.email, {
        id: values.id,
        email: values.email,
        name: values.name,
        role: "founder",
        emailVerified: true,
      });
    },
    async updateFounderUser(values) {
      operations.push("update-founder");
      users.set(values.email, {
        id: values.id,
        email: values.email,
        name: values.name,
        role: "founder",
        emailVerified: true,
      });
    },
    async findCredentialAccount(userId) {
      return accounts.get(userId);
    },
    async insertCredentialAccount(values) {
      operations.push("insert-credential");
      accounts.set(values.userId, {
        id: values.id,
        userId: values.userId,
        passwordHash: values.passwordHash,
      });
    },
    async updateCredentialAccount(values) {
      operations.push(
        values.passwordHash ? "reset-credential" : "preserve-credential",
      );
      const existing = accounts.get(values.userId);
      if (!existing) throw new Error("Missing credential");
      accounts.set(values.userId, {
        ...existing,
        passwordHash: values.passwordHash ?? existing.passwordHash,
      });
    },
    async findWorkspaceBySlug(slug) {
      return workspaces.get(slug);
    },
    async insertInitialWorkspace(values) {
      operations.push("insert-workspace");
      workspaces.set(values.slug, {
        id: values.id,
        name: values.name,
        slug: values.slug,
        createdById: null,
      });
    },
    async updateInitialWorkspace(values) {
      operations.push("update-workspace");
      const existing = workspaces.get(values.slug);
      if (!existing) throw new Error("Missing workspace");
      workspaces.set(values.slug, {
        ...existing,
        name: values.name,
      });
    },
    async close() {
      operations.push("close");
    },
  };

  return { store, users, accounts, workspaces, operations };
}

function createConfig(
  overrides: Partial<FounderSeedConfig> = {},
): FounderSeedConfig {
  return {
    databaseUrl: fictiveDatabaseUrl,
    founderEmail,
    founderName,
    founderInitialPassword,
    resetPassword: false,
    workspaceName: "Example Project",
    workspaceSlug: "example-project",
    ...overrides,
  };
}

describe("founder seed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requires founder environment values before connecting to the database", () => {
    const result = runSeed({ FOUNDER_EMAIL: "" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("FOUNDER_EMAIL is required");
  });

  it("parses founder and initial workspace env without password defaults", async () => {
    const { readFounderSeedConfig } = await importSeedModule();

    const config = readFounderSeedConfig({
      ...baseEnv,
      FOUNDER_EMAIL: "Founder@Example.Test",
      INITIAL_WORKSPACE_NAME: "Client Organization",
      INITIAL_WORKSPACE_SLUG: "client-org",
    });

    expect(config).toMatchObject({
      founderEmail: "founder@example.test",
      founderName: "Example Founder",
      founderInitialPassword: "example-password-123",
      workspaceName: "Client Organization",
      workspaceSlug: "client-org",
      resetPassword: false,
    });
  });

  it("creates the founder, credential account, and initial workspace idempotent records", async () => {
    const { seedFounderAndInitialWorkspace } = await importSeedModule();
    const fake = createFakeStore();
    const hashPassword = vi.fn(async () => "hashed-password");
    const ids = ["founder-id", "credential-id", "workspace-id"];

    const result = await seedFounderAndInitialWorkspace({
      config: createConfig(),
      store: fake.store,
      passwordHasher: hashPassword,
      now: new Date("2026-06-28T10:00:00.000Z"),
      createId: () => ids.shift() ?? "unexpected-id",
    });

    expect(result).toMatchObject({
      founderCreated: true,
      credentialCreated: true,
      passwordReset: false,
      workspaceCreated: true,
    });
    expect(fake.users.get(founderEmail)).toMatchObject({
      id: "founder-id",
      role: "founder",
      emailVerified: true,
    });
    expect(fake.accounts.get("founder-id")).toMatchObject({
      id: "credential-id",
      passwordHash: "hashed-password",
    });
    expect(fake.workspaces.get("example-project")).toMatchObject({
      id: "workspace-id",
      createdById: null,
    });
    expect(hashPassword).toHaveBeenCalledWith("example-password-123");
    expect(fake.operations).toEqual([
      "insert-founder",
      "insert-credential",
      "insert-workspace",
    ]);
  });

  it("preserves an existing founder credential password without the reset flag", async () => {
    const { seedFounderAndInitialWorkspace } = await importSeedModule();
    const fake = createFakeStore({
      user: {
        id: "founder-id",
        email: founderEmail,
        name: "Old Name",
        role: "user",
        emailVerified: false,
      },
      account: {
        id: "credential-id",
        userId: "founder-id",
        passwordHash: "existing-hash",
      },
      workspace: {
        id: "workspace-id",
        name: "Old Workspace",
        slug: "example-project",
        createdById: null,
      },
    });
    const hashPassword = vi.fn(async () => "new-hash");

    const result = await seedFounderAndInitialWorkspace({
      config: createConfig(),
      store: fake.store,
      passwordHasher: hashPassword,
    });

    expect(result).toMatchObject({
      founderCreated: false,
      credentialCreated: false,
      passwordReset: false,
      workspaceCreated: false,
    });
    expect(fake.accounts.get("founder-id")?.passwordHash).toBe("existing-hash");
    expect(fake.users.get(founderEmail)).toMatchObject({
      name: "Example Founder",
      role: "founder",
      emailVerified: true,
    });
    expect(fake.workspaces.get("example-project")?.name).toBe(
      "Example Project",
    );
    expect(hashPassword).not.toHaveBeenCalled();
    expect(fake.operations).toEqual([
      "update-founder",
      "preserve-credential",
      "update-workspace",
    ]);
  });

  it("resets an existing founder credential password only with explicit intent", async () => {
    const { seedFounderAndInitialWorkspace } = await importSeedModule();
    const fake = createFakeStore({
      user: {
        id: "founder-id",
        email: founderEmail,
        name: "Example Founder",
        role: "founder",
        emailVerified: true,
      },
      account: {
        id: "credential-id",
        userId: "founder-id",
        passwordHash: "existing-hash",
      },
    });
    const hashPassword = vi.fn(async () => "rotated-hash");

    const result = await seedFounderAndInitialWorkspace({
      config: createConfig({ resetPassword: true }),
      store: fake.store,
      passwordHasher: hashPassword,
    });

    expect(result.passwordReset).toBe(true);
    expect(fake.accounts.get("founder-id")?.passwordHash).toBe("rotated-hash");
    expect(hashPassword).toHaveBeenCalledWith("example-password-123");
    expect(fake.operations).toContain("reset-credential");
  });

  it("does not retain demo admin credentials or admin env fallbacks in the official seed", () => {
    const source = readFileSync(scriptPath, "utf8");

    expect(source).not.toContain("admin@example.local");
    expect(source).not.toContain("AdminPassword123");
    expect(source).not.toContain("ADMIN_EMAIL");
    expect(source).not.toContain("ADMIN_PASSWORD");
    expect(source).not.toContain("ADMIN_NAME");
  });
});
