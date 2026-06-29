import { describe, expect, it } from "vitest";
import {
  assignableWorkspaceRoles,
  canAssignWorkspaceRole,
  canManageWorkspaceRole,
  canWorkspaceRoleManagePlatformRole,
  compareWorkspaceRoles,
  isAssignableWorkspaceRole,
  isWorkspaceRole,
  workspaceRoleDefinitions,
  workspaceRoleAtLeast,
  workspaceRoles,
} from "@/features/workspace/roles";

describe("workspace role hierarchy", () => {
  it("recognizes the client workspace role set without global client roles", () => {
    expect(workspaceRoles).toEqual([
      "owner",
      "admin",
      "manager",
      "staff",
      "editor",
      "viewer",
    ]);
    expect(isWorkspaceRole("owner")).toBe(true);
    expect(isWorkspaceRole("viewer")).toBe(true);
    expect(isWorkspaceRole("founder")).toBe(false);
    expect(isWorkspaceRole("member")).toBe(false);
    expect(assignableWorkspaceRoles).toEqual([
      "admin",
      "manager",
      "staff",
      "editor",
      "viewer",
    ]);
    expect(isAssignableWorkspaceRole("admin")).toBe(true);
    expect(isAssignableWorkspaceRole("owner")).toBe(false);
  });

  it("orders workspace roles from owner down to viewer", () => {
    expect(workspaceRoleAtLeast("owner", "admin")).toBe(true);
    expect(workspaceRoleAtLeast("admin", "manager")).toBe(true);
    expect(workspaceRoleAtLeast("manager", "staff")).toBe(true);
    expect(workspaceRoleAtLeast("staff", "editor")).toBe(true);
    expect(workspaceRoleAtLeast("editor", "viewer")).toBe(true);
    expect(compareWorkspaceRoles("viewer", "owner")).toBeLessThan(0);
  });

  it("requires a strictly higher workspace role to manage another workspace role", () => {
    expect(canManageWorkspaceRole("owner", "admin")).toBe(true);
    expect(canManageWorkspaceRole("admin", "owner")).toBe(false);
    expect(canManageWorkspaceRole("manager", "manager")).toBe(false);
    expect(canAssignWorkspaceRole("admin", "manager")).toBe(true);
    expect(canAssignWorkspaceRole("admin", "admin")).toBe(false);
    expect(canAssignWorkspaceRole("manager", "admin")).toBe(false);
  });

  it("documents each workspace role exposed in founder perspective exploration", () => {
    for (const workspaceRole of workspaceRoles) {
      expect(workspaceRoleDefinitions[workspaceRole].label).toEqual(
        expect.any(String),
      );
      expect(workspaceRoleDefinitions[workspaceRole].description).toEqual(
        expect.any(String),
      );
    }
  });

  it("never lets workspace roles administer platform roles", () => {
    for (const workspaceRole of workspaceRoles) {
      expect(canWorkspaceRoleManagePlatformRole(workspaceRole, "founder")).toBe(
        false,
      );
      expect(canWorkspaceRoleManagePlatformRole(workspaceRole, "user")).toBe(
        false,
      );
    }
  });
});
