/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AdministrationPlaceholder } from "@/features/backoffice/components/AdministrationPlaceholder";
import type { DashboardViewOption } from "@/features/backoffice/view-mode";

const viewOptions: DashboardViewOption[] = [
  { mode: "founder", label: "Founder", permissions: null },
  {
    mode: "admin",
    label: "Admin",
    permissions: { navigation: ["dashboard", "administration"] },
  },
  {
    mode: "role:operations",
    label: "Operations",
    permissions: { navigation: ["dashboard"] },
  },
];

const workspace = { id: "workspace_1", name: "Workspace", slug: "workspace" };

afterEach(cleanup);

describe("dashboard administration surface", () => {
  it("shows only member management in admin perspective", () => {
    render(
      <AdministrationPlaceholder
        isFounder={false}
        viewMode="admin"
        viewOptions={viewOptions}
        canPersistRoles
        canManageAdmins
        workspace={workspace}
        memberManagement={<div>Gestion users</div>}
        adminManagement={<div>Gestion admins</div>}
        roleManagement={<div>Gestion roles</div>}
      />,
    );

    expect(screen.getByText("Gestion users")).toBeInTheDocument();
    expect(screen.queryByText("Gestion admins")).not.toBeInTheDocument();
    expect(screen.queryByText("Gestion workspaces")).not.toBeInTheDocument();
    expect(screen.queryByText("Gestion roles")).not.toBeInTheDocument();
    expect(screen.queryByText("Assigner un rôle")).not.toBeInTheDocument();
  });

  it("does not expose role assignment in founder administration", () => {
    render(
      <AdministrationPlaceholder
        isFounder
        viewMode="founder"
        viewOptions={viewOptions}
        canPersistRoles
        canManageAdmins
        workspace={workspace}
        adminManagement={<div>Gestion admins</div>}
        roleManagement={<div>Gestion roles</div>}
      />,
    );

    expect(screen.getByText("Gestion admins")).toBeInTheDocument();
    expect(screen.getByText("Gestion roles")).toBeInTheDocument();
    expect(screen.queryByText("Assigner un rôle")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Assignez un rôle workspace personnalisé/i),
    ).not.toBeInTheDocument();
  });

  it("renders no denial copy for a role without administration access", () => {
    const { container } = render(
      <AdministrationPlaceholder
        isFounder={false}
        viewMode="role:operations"
        viewOptions={viewOptions}
        canPersistRoles
        canManageAdmins={false}
        workspace={workspace}
        memberManagement={<div>Gestion users</div>}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/non autorisé/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ne dispose pas/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Gestion users")).not.toBeInTheDocument();
  });
});
