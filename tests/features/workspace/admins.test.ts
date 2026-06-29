import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("node:crypto", () => ({ randomUUID: vi.fn(() => "generated_id") }));
vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn(async () => "hashed_password"),
}));
vi.mock("@/features/workspace/repository", () => ({
  findCredentialAccount: vi.fn(),
  findWorkspaceAdminUserByEmail: vi.fn(),
  findWorkspaceById: vi.fn(),
  findWorkspaceMembership: vi.fn(),
  findWorkspaceMembershipById: vi.fn(),
  insertCredentialAccount: vi.fn(),
  insertWorkspaceAdminUser: vi.fn(),
  insertWorkspaceMembership: vi.fn(),
  listWorkspaces: vi.fn(),
  updateWorkspaceMembershipRole: vi.fn(),
}));

import {
  assignWorkspaceMemberRole,
  createWorkspaceAdmin,
} from "@/features/workspace/service";
import * as repository from "@/features/workspace/repository";

const workspace = {
  id: "workspace_1",
  name: "Initial Workspace",
  slug: "initial-workspace",
};

const createdUser = {
  id: "user_admin",
  email: "admin@example.test",
  name: "Admin",
  role: "user",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(repository.findWorkspaceById).mockResolvedValue(workspace);
  vi.mocked(repository.findWorkspaceAdminUserByEmail).mockResolvedValue(null);
  vi.mocked(repository.insertWorkspaceAdminUser).mockResolvedValue(createdUser);
  vi.mocked(repository.findCredentialAccount).mockResolvedValue(null);
  vi.mocked(repository.findWorkspaceMembership).mockResolvedValue(null);
});

describe("workspace admin creation", () => {
  it("allows a founder to create a user credential and admin membership", async () => {
    const result = await createWorkspaceAdmin({
      actorRole: "founder",
      workspaceId: "workspace_1",
      name: " Admin ",
      email: "ADMIN@example.test",
      initialPassword: "AdminPassword123",
    });

    expect(result).toEqual({
      userId: "user_admin",
      workspaceId: "workspace_1",
      userCreated: true,
      credentialCreated: true,
      membershipCreated: true,
      role: "admin",
    });
    expect(repository.insertWorkspaceAdminUser).toHaveBeenCalledWith({
      id: "generated_id",
      email: "admin@example.test",
      name: "Admin",
      now: expect.any(Date),
    });
    expect(repository.insertWorkspaceMembership).toHaveBeenCalledWith({
      id: "generated_id",
      workspaceId: "workspace_1",
      userId: "user_admin",
      role: "admin",
      now: expect.any(Date),
    });
  });

  it("rejects non-founder platform users", async () => {
    await expect(
      createWorkspaceAdmin({
        actorRole: "user",
        workspaceId: "workspace_1",
        name: "Admin",
        email: "admin@example.test",
        initialPassword: "AdminPassword123",
      }),
    ).rejects.toThrow("Only a founder");
  });

  it("does not turn an existing user into a platform admin role", async () => {
    vi.mocked(repository.findWorkspaceAdminUserByEmail).mockResolvedValue({
      ...createdUser,
      id: "existing_user",
    });
    vi.mocked(repository.findCredentialAccount).mockResolvedValue({
      id: "account_1",
    });

    await createWorkspaceAdmin({
      actorRole: "founder",
      workspaceId: "workspace_1",
      name: "Admin",
      email: "admin@example.test",
      initialPassword: "AdminPassword123",
    });

    expect(repository.insertWorkspaceAdminUser).not.toHaveBeenCalled();
    expect(repository.insertCredentialAccount).not.toHaveBeenCalled();
    expect(repository.insertWorkspaceMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "existing_user",
        role: "admin",
      }),
    );
  });

  it("refuses to manage a founder account as a workspace admin", async () => {
    vi.mocked(repository.findWorkspaceAdminUserByEmail).mockResolvedValue({
      ...createdUser,
      role: "founder",
    });

    await expect(
      createWorkspaceAdmin({
        actorRole: "founder",
        workspaceId: "workspace_1",
        name: "Founder",
        email: "founder@example.test",
        initialPassword: "FounderPassword123",
      }),
    ).rejects.toThrow("Founder accounts cannot be managed");
  });
});

describe("workspace role assignment", () => {
  it("allows an admin to assign lower workspace roles to registered members", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "manager",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue({
      id: "actor_membership",
      role: "admin",
    });

    await expect(
      assignWorkspaceMemberRole({
        actorUserId: "actor_user",
        membershipId: "membership_1",
        role: "editor",
      }),
    ).resolves.toEqual({
      membershipId: "membership_1",
      role: "editor",
    });
    expect(repository.updateWorkspaceMembershipRole).toHaveBeenCalledWith({
      membershipId: "membership_1",
      role: "editor",
      now: expect.any(Date),
    });
  });

  it("prevents an admin from assigning admin or owner authority", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "manager",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue({
      id: "actor_membership",
      role: "admin",
    });

    await expect(
      assignWorkspaceMemberRole({
        actorUserId: "actor_user",
        membershipId: "membership_1",
        role: "admin",
      }),
    ).rejects.toThrow("not high enough");
  });

  it("requires the actor to be a member of the same workspace", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "manager",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue(null);

    await expect(
      assignWorkspaceMemberRole({
        actorUserId: "actor_user",
        membershipId: "membership_1",
        role: "viewer",
      }),
    ).rejects.toThrow("membership required");
  });

  it("prevents managing a member with an equal or higher role", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "admin",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue({
      id: "actor_membership",
      role: "admin",
    });

    await expect(
      assignWorkspaceMemberRole({
        actorUserId: "actor_user",
        membershipId: "membership_1",
        role: "viewer",
      }),
    ).rejects.toThrow("not high enough");
  });
});
