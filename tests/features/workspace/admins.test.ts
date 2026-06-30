import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("node:crypto", () => ({ randomUUID: vi.fn(() => "generated_id") }));
vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn(async () => "hashed_password"),
}));
vi.mock("@/features/workspace/repository", () => ({
  deleteWorkspace: vi.fn(),
  deleteWorkspaceCustomRole: vi.fn(),
  deleteWorkspaceMembership: vi.fn(),
  findCredentialAccount: vi.fn(),
  findWorkspaceCustomRoleById: vi.fn(),
  findWorkspaceCustomRoleBySlug: vi.fn(),
  findWorkspaceAdminUserById: vi.fn(),
  findWorkspaceAdminUserByEmail: vi.fn(),
  findWorkspaceById: vi.fn(),
  findWorkspaceBySlug: vi.fn(),
  findWorkspaceMembership: vi.fn(),
  findWorkspaceMembershipById: vi.fn(),
  insertWorkspace: vi.fn(),
  insertWorkspaceCustomRole: vi.fn(),
  insertCredentialAccount: vi.fn(),
  insertWorkspaceAdminUser: vi.fn(),
  insertWorkspaceMembership: vi.fn(),
  listWorkspaces: vi.fn(),
  listWorkspacesForMember: vi.fn(),
  updateWorkspace: vi.fn(),
  updateWorkspaceAdminUser: vi.fn(),
  updateWorkspaceCustomRole: vi.fn(),
  updateWorkspaceMembershipWorkspace: vi.fn(),
  updateWorkspaceMembershipRole: vi.fn(),
  upsertWorkspaceMembershipCustomRole: vi.fn(),
}));

import {
  assignWorkspaceMemberCustomRole,
  assignWorkspaceMemberRole,
  createWorkspace,
  createWorkspaceAdmin,
  createWorkspaceCustomRole,
  deleteWorkspaceAdmin,
  deleteWorkspaceConfiguration,
  deleteWorkspaceCustomRoleConfiguration,
  getAdministrationWorkspaceOptions,
  updateWorkspaceAdmin,
  updateWorkspaceConfiguration,
  updateWorkspaceCustomRoleConfiguration,
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
  vi.mocked(repository.findWorkspaceBySlug).mockResolvedValue(null);
  vi.mocked(repository.insertWorkspace).mockResolvedValue({
    id: "generated_id",
    name: "Support Workspace",
    slug: "support-workspace",
  });
  vi.mocked(repository.updateWorkspace).mockResolvedValue({
    id: "workspace_1",
    name: "Project Ops",
    slug: "project-ops",
  });
  vi.mocked(repository.findWorkspaceAdminUserById).mockResolvedValue(
    createdUser,
  );
  vi.mocked(repository.findWorkspaceAdminUserByEmail).mockResolvedValue(null);
  vi.mocked(repository.insertWorkspaceAdminUser).mockResolvedValue(createdUser);
  vi.mocked(repository.updateWorkspaceAdminUser).mockResolvedValue({
    ...createdUser,
    name: "Admin Ops",
    email: "ops@example.test",
  });
  vi.mocked(repository.findCredentialAccount).mockResolvedValue(null);
  vi.mocked(repository.findWorkspaceMembership).mockResolvedValue(null);
  vi.mocked(repository.findWorkspaceCustomRoleBySlug).mockResolvedValue(null);
  vi.mocked(repository.findWorkspaceCustomRoleById).mockResolvedValue({
    id: "role_support",
    workspaceId: "workspace_1",
    name: "Support",
    slug: "support",
    description: null,
    permissions: { navigation: ["dashboard"] },
  });
  vi.mocked(repository.insertWorkspaceCustomRole).mockResolvedValue({
    id: "generated_id",
    workspaceId: "workspace_1",
    name: "Support",
    slug: "support",
    description: "Support client",
    permissions: { navigation: ["dashboard"] },
  });
  vi.mocked(repository.updateWorkspaceCustomRole).mockResolvedValue({
    id: "role_support",
    workspaceId: "workspace_1",
    name: "Support avancé",
    slug: "support-avance",
    description: "Support niveau 2",
    permissions: { navigation: ["dashboard", "administration"] },
  });
  vi.mocked(repository.listWorkspaces).mockResolvedValue([workspace]);
  vi.mocked(repository.listWorkspacesForMember).mockResolvedValue([workspace]);
});

describe("administration workspace options", () => {
  it("lists all workspaces for a founder", async () => {
    await expect(
      getAdministrationWorkspaceOptions({
        actorRole: "founder",
        actorUserId: "founder_user",
      }),
    ).resolves.toEqual([workspace]);
    expect(repository.listWorkspaces).toHaveBeenCalled();
    expect(repository.listWorkspacesForMember).not.toHaveBeenCalled();
  });

  it("lists only active membership workspaces for regular users", async () => {
    await expect(
      getAdministrationWorkspaceOptions({
        actorRole: "user",
        actorUserId: "admin_user",
      }),
    ).resolves.toEqual([workspace]);
    expect(repository.listWorkspacesForMember).toHaveBeenCalledWith(
      "admin_user",
    );
    expect(repository.listWorkspaces).not.toHaveBeenCalled();
  });
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

describe("workspace admin configuration", () => {
  it("allows a founder to update an admin membership and user profile", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "admin",
      userId: "user_admin",
      workspaceId: "workspace_1",
    });

    await expect(
      updateWorkspaceAdmin({
        actorRole: "founder",
        membershipId: "membership_1",
        workspaceId: "workspace_1",
        name: "Admin Ops",
        email: "ops@example.test",
      }),
    ).resolves.toEqual({
      membershipId: "membership_1",
      workspaceId: "workspace_1",
      userId: "user_admin",
      name: "Admin Ops",
      email: "ops@example.test",
      bootstrapRole: "admin",
      customRoleId: null,
    });
    expect(repository.updateWorkspaceAdminUser).toHaveBeenCalledWith({
      id: "user_admin",
      name: "Admin Ops",
      email: "ops@example.test",
      now: expect.any(Date),
    });
  });

  it("allows a founder to remove an admin membership without deleting the user", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "admin",
      userId: "user_admin",
      workspaceId: "workspace_1",
    });

    await expect(
      deleteWorkspaceAdmin({
        actorRole: "founder",
        membershipId: "membership_1",
      }),
    ).resolves.toEqual({ membershipId: "membership_1" });
    expect(repository.deleteWorkspaceMembership).toHaveBeenCalledWith(
      "membership_1",
    );
  });

  it("rejects workspace admins configuring admins", async () => {
    await expect(
      updateWorkspaceAdmin({
        actorRole: "user",
        membershipId: "membership_1",
        workspaceId: "workspace_1",
        name: "Admin Ops",
        email: "ops@example.test",
      }),
    ).rejects.toThrow("Only a founder can configure workspace admins");
  });
});

describe("workspace configuration", () => {
  it("allows a founder to create a workspace", async () => {
    await expect(
      createWorkspace({
        actorRole: "founder",
        actorUserId: "local_founder",
        name: " Support Workspace ",
      }),
    ).resolves.toEqual({
      id: "generated_id",
      name: "Support Workspace",
      slug: "support-workspace",
    });
    expect(repository.insertWorkspace).toHaveBeenCalledWith({
      id: "generated_id",
      name: "Support Workspace",
      slug: "support-workspace",
      createdById: null,
      now: expect.any(Date),
    });
  });

  it("allows a founder to update a workspace", async () => {
    await expect(
      updateWorkspaceConfiguration({
        actorRole: "founder",
        actorUserId: "local_founder",
        workspaceId: "workspace_1",
        name: " Project Ops ",
      }),
    ).resolves.toEqual({
      id: "workspace_1",
      name: "Project Ops",
      slug: "project-ops",
    });
    expect(repository.updateWorkspace).toHaveBeenCalledWith({
      id: "workspace_1",
      name: "Project Ops",
      slug: "project-ops",
      now: expect.any(Date),
    });
  });

  it("allows a founder to delete a workspace", async () => {
    await expect(
      deleteWorkspaceConfiguration({
        actorRole: "founder",
        workspaceId: "workspace_1",
      }),
    ).resolves.toEqual({ workspaceId: "workspace_1" });
    expect(repository.deleteWorkspace).toHaveBeenCalledWith("workspace_1");
  });
});

describe("workspace role assignment", () => {
  it("allows an owner to assign admin bootstrap role to registered members", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "admin",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue({
      id: "actor_membership",
      role: "owner",
    });

    await expect(
      assignWorkspaceMemberRole({
        actorUserId: "actor_user",
        membershipId: "membership_1",
        role: "admin",
      }),
    ).resolves.toEqual({
      membershipId: "membership_1",
      role: "admin",
    });
    expect(repository.updateWorkspaceMembershipRole).toHaveBeenCalledWith({
      membershipId: "membership_1",
      role: "admin",
      now: expect.any(Date),
    });
  });

  it("prevents an admin from assigning admin authority", async () => {
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
        role: "admin",
      }),
    ).rejects.toThrow("not high enough");
  });

  it("requires the actor to be a member of the same workspace", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "admin",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue(null);

    await expect(
      assignWorkspaceMemberRole({
        actorUserId: "actor_user",
        membershipId: "membership_1",
        role: "admin",
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
        role: "admin",
      }),
    ).rejects.toThrow("not high enough");
  });
});

describe("workspace custom role creation", () => {
  it("allows a founder to create a role with navigation permissions", async () => {
    await expect(
      createWorkspaceCustomRole({
        actorRole: "founder",
        actorUserId: "founder_user",
        workspaceId: "workspace_1",
        name: " Support ",
        description: " Support client ",
        permissions: { navigation: ["dashboard", "dashboard"] },
      }),
    ).resolves.toEqual({
      id: "generated_id",
      workspaceId: "workspace_1",
      name: "Support",
      slug: "support",
      description: "Support client",
      permissions: { navigation: ["dashboard"] },
    });
    expect(repository.insertWorkspaceCustomRole).toHaveBeenCalledWith({
      id: "generated_id",
      workspaceId: "workspace_1",
      name: "Support",
      slug: "support",
      description: "Support client",
      permissions: { navigation: ["dashboard"] },
      createdById: null,
      now: expect.any(Date),
    });
  });

  it("rejects workspace admins creating custom roles", async () => {
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue({
      id: "actor_membership",
      role: "admin",
    });

    await expect(
      createWorkspaceCustomRole({
        actorRole: "user",
        actorUserId: "admin_user",
        workspaceId: "workspace_1",
        name: "Support",
        permissions: { navigation: ["dashboard"] },
      }),
    ).rejects.toThrow("Only a founder can create workspace roles");
    expect(repository.insertWorkspaceCustomRole).not.toHaveBeenCalled();
  });

  it("rejects non-founder users before membership checks", async () => {
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue(null);

    await expect(
      createWorkspaceCustomRole({
        actorRole: "user",
        actorUserId: "user_without_membership",
        workspaceId: "workspace_1",
        name: "Support",
        permissions: { navigation: ["dashboard"] },
      }),
    ).rejects.toThrow("Only a founder can create workspace roles");
    expect(repository.findWorkspaceMembership).not.toHaveBeenCalled();
  });

  it("rejects duplicate workspace role slugs", async () => {
    vi.mocked(repository.findWorkspaceCustomRoleBySlug).mockResolvedValue({
      id: "role_1",
      workspaceId: "workspace_1",
      name: "Support",
      slug: "support",
      description: null,
      permissions: { navigation: ["dashboard"] },
    });

    await expect(
      createWorkspaceCustomRole({
        actorRole: "founder",
        actorUserId: "founder_user",
        workspaceId: "workspace_1",
        name: "Support",
        permissions: { navigation: ["dashboard"] },
      }),
    ).rejects.toThrow("already exists");
  });
});

describe("workspace custom role configuration", () => {
  it("allows a founder to update role navigation permissions", async () => {
    await expect(
      updateWorkspaceCustomRoleConfiguration({
        actorRole: "founder",
        actorUserId: "local_founder",
        roleId: "role_support",
        workspaceId: "workspace_1",
        name: " Support avancé ",
        description: " Support niveau 2 ",
        permissions: { navigation: ["dashboard", "administration"] },
      }),
    ).resolves.toEqual({
      id: "role_support",
      workspaceId: "workspace_1",
      name: "Support avancé",
      slug: "support-avance",
      description: "Support niveau 2",
      permissions: { navigation: ["dashboard", "administration"] },
    });
    expect(repository.updateWorkspaceCustomRole).toHaveBeenCalledWith({
      id: "role_support",
      workspaceId: "workspace_1",
      name: "Support avancé",
      slug: "support-avance",
      description: "Support niveau 2",
      permissions: { navigation: ["dashboard", "administration"] },
      now: expect.any(Date),
    });
  });

  it("rejects workspace admins configuring custom roles", async () => {
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue({
      id: "actor_membership",
      role: "admin",
    });

    await expect(
      updateWorkspaceCustomRoleConfiguration({
        actorRole: "user",
        actorUserId: "admin_user",
        roleId: "role_support",
        workspaceId: "workspace_1",
        name: "Support avancé",
        permissions: { navigation: ["dashboard", "administration"] },
      }),
    ).rejects.toThrow("Only a founder can configure workspace roles");
    expect(repository.updateWorkspaceCustomRole).not.toHaveBeenCalled();
  });

  it("rejects moving an existing custom role to another workspace", async () => {
    vi.mocked(repository.findWorkspaceById).mockResolvedValue({
      id: "workspace_2",
      name: "Second Workspace",
      slug: "second-workspace",
    });

    await expect(
      updateWorkspaceCustomRoleConfiguration({
        actorRole: "founder",
        actorUserId: "local_founder",
        roleId: "role_support",
        workspaceId: "workspace_2",
        name: "Support",
        permissions: { navigation: ["dashboard"] },
      }),
    ).rejects.toThrow("Workspace role moves are not supported yet");
    expect(repository.updateWorkspaceCustomRole).not.toHaveBeenCalled();
  });

  it("allows a founder to delete a custom role", async () => {
    await expect(
      deleteWorkspaceCustomRoleConfiguration({
        actorRole: "founder",
        roleId: "role_support",
      }),
    ).resolves.toEqual({ roleId: "role_support" });
    expect(repository.deleteWorkspaceCustomRole).toHaveBeenCalledWith(
      "role_support",
    );
  });
});

describe("workspace custom role assignment", () => {
  it("allows an admin membership to assign a custom role in the same workspace", async () => {
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
      assignWorkspaceMemberCustomRole({
        actorRole: "user",
        actorUserId: "actor_user",
        membershipId: "membership_1",
        roleId: "role_support",
      }),
    ).resolves.toEqual({
      membershipId: "membership_1",
      roleId: "role_support",
    });
    expect(repository.upsertWorkspaceMembershipCustomRole).toHaveBeenCalledWith(
      {
        membershipId: "membership_1",
        roleId: "role_support",
        assignedById: "actor_user",
        now: expect.any(Date),
      },
    );
  });

  it("allows a founder to assign a custom role without a workspace membership", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "admin",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceMembership).mockResolvedValue(null);

    await expect(
      assignWorkspaceMemberCustomRole({
        actorRole: "founder",
        actorUserId: "local_founder",
        membershipId: "membership_1",
        roleId: "role_support",
      }),
    ).resolves.toEqual({
      membershipId: "membership_1",
      roleId: "role_support",
    });
    expect(repository.upsertWorkspaceMembershipCustomRole).toHaveBeenCalledWith(
      {
        membershipId: "membership_1",
        roleId: "role_support",
        assignedById: null,
        now: expect.any(Date),
      },
    );
  });

  it("rejects custom roles from another workspace", async () => {
    vi.mocked(repository.findWorkspaceMembershipById).mockResolvedValue({
      id: "membership_1",
      role: "admin",
      userId: "user_1",
      workspaceId: "workspace_1",
    });
    vi.mocked(repository.findWorkspaceCustomRoleById).mockResolvedValue({
      id: "role_other",
      workspaceId: "workspace_2",
      name: "Other",
      slug: "other",
      description: null,
      permissions: { navigation: ["dashboard"] },
    });

    await expect(
      assignWorkspaceMemberCustomRole({
        actorRole: "user",
        actorUserId: "actor_user",
        membershipId: "membership_1",
        roleId: "role_other",
      }),
    ).rejects.toThrow("not found");
  });
});
