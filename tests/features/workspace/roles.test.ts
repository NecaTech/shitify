import { describe, expect, it } from "vitest";
import {
  assignableWorkspaceRoles,
  bootstrapWorkspaceRoleDefinitions,
  bootstrapWorkspaceRoles,
  canAssignWorkspaceRole,
  canManageWorkspaceRole,
  canWorkspaceRoleManagePlatformRole,
  compareWorkspaceRoles,
  dashboardNavigationPermissions,
  isAssignableWorkspaceRole,
  normalizeWorkspaceRolePermissions,
  isWorkspaceRole,
  workspaceRoleAtLeast,
} from "@/features/workspace/roles";

describe("workspace role hierarchy", () => {
  it("recognizes the client workspace role set without global client roles", () => {
    expect(bootstrapWorkspaceRoles).toEqual(["owner", "admin", "member"]);
    expect(isWorkspaceRole("owner")).toBe(true);
    expect(isWorkspaceRole("admin")).toBe(true);
    expect(isWorkspaceRole("viewer")).toBe(false);
    expect(isWorkspaceRole("founder")).toBe(false);
    expect(isWorkspaceRole("member")).toBe(true);
    expect(assignableWorkspaceRoles).toEqual(["admin", "member"]);
    expect(isAssignableWorkspaceRole("admin")).toBe(true);
    expect(isAssignableWorkspaceRole("member")).toBe(true);
    expect(isAssignableWorkspaceRole("owner")).toBe(false);
  });

  it("orders bootstrap workspace roles", () => {
    expect(workspaceRoleAtLeast("owner", "admin")).toBe(true);
    expect(workspaceRoleAtLeast("admin", "member")).toBe(true);
    expect(compareWorkspaceRoles("admin", "owner")).toBeLessThan(0);
  });

  it("requires a strictly higher workspace role to manage another workspace role", () => {
    expect(canManageWorkspaceRole("owner", "admin")).toBe(true);
    expect(canManageWorkspaceRole("admin", "member")).toBe(true);
    expect(canManageWorkspaceRole("admin", "owner")).toBe(false);
    expect(canAssignWorkspaceRole("admin", "admin")).toBe(false);
  });

  it("documents bootstrap roles and normalizes custom role permissions", () => {
    for (const workspaceRole of bootstrapWorkspaceRoles) {
      expect(bootstrapWorkspaceRoleDefinitions[workspaceRole].label).toEqual(
        expect.any(String),
      );
    }
    expect(dashboardNavigationPermissions).toEqual([
      "dashboard",
      "administration",
    ]);
    expect(
      normalizeWorkspaceRolePermissions({
        navigation: ["dashboard", "dashboard", "administration"],
      }),
    ).toEqual({ navigation: ["dashboard", "administration"] });
    expect(normalizeWorkspaceRolePermissions({ navigation: [] })).toEqual({
      navigation: ["dashboard"],
    });
  });

  it("never lets workspace roles administer platform roles", () => {
    for (const workspaceRole of bootstrapWorkspaceRoles) {
      expect(canWorkspaceRoleManagePlatformRole(workspaceRole, "founder")).toBe(
        false,
      );
      expect(canWorkspaceRoleManagePlatformRole(workspaceRole, "user")).toBe(
        false,
      );
    }
  });
});
