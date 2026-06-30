import { existsSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  dashboardNavigation,
  getDashboardRouteTitle,
  getVisibleDashboardLinks,
} from "@/features/dashboard/config";
import { shouldLoadFounderWorkspaceRoles } from "@/features/dashboard/workspace-role-loading";
import type { DashboardViewOption } from "@/features/dashboard/view-mode";

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

function flattenVisibleLinks() {
  return dashboardNavigation.flatMap((item) => {
    if (!item.visible) return [];
    if (item.type === "link") return [item];
    return item.items.filter((child) => child.visible);
  });
}

describe("dashboard navigation", () => {
  it("exposes only the native dashboard sections", () => {
    expect(flattenVisibleLinks().map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard/administration",
    ]);
  });

  it("does not require a separate Pilote route or the removed CRUD route", () => {
    const repoRoot = process.cwd();

    expect(
      existsSync(
        join(repoRoot, "src/app/(authenticated)/dashboard/pilote/page.tsx"),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(repoRoot, "src/app/(authenticated)/dashboard/crud/page.tsx"),
      ),
    ).toBe(false);
    expect(existsSync(join(repoRoot, "src/features/crud"))).toBe(false);
  });

  it("resolves compact route titles from the centralized nav config", () => {
    expect(getDashboardRouteTitle("/dashboard")).toBe("Pilote");
    expect(getDashboardRouteTitle("/dashboard/administration")).toBe(
      "Administration",
    );
    expect(getDashboardRouteTitle("/dashboard/administration/membres")).toBe(
      "Administration",
    );
  });

  it("filters administration views by explored workspace role", () => {
    expect(
      getVisibleDashboardLinks("founder", viewOptions).map((item) => item.href),
    ).toEqual(["/dashboard", "/dashboard/administration"]);
    expect(
      getVisibleDashboardLinks("admin", viewOptions).map((item) => item.href),
    ).toEqual(["/dashboard", "/dashboard/administration"]);
    expect(
      getVisibleDashboardLinks("role:operations", viewOptions).map(
        (item) => item.href,
      ),
    ).toEqual(["/dashboard"]);
    expect(
      getDashboardRouteTitle(
        "/dashboard/administration",
        "role:operations",
        viewOptions,
      ),
    ).toBe("Dashboard");
  });

  it("loads founder workspace roles from DB in dev and staging only", () => {
    expect(
      shouldLoadFounderWorkspaceRoles({
        appEnv: "dev",
        hasDatabaseUrl: true,
        isFounder: true,
      }),
    ).toBe(true);
    expect(
      shouldLoadFounderWorkspaceRoles({
        appEnv: "staging",
        hasDatabaseUrl: true,
        isFounder: true,
      }),
    ).toBe(true);
    expect(
      shouldLoadFounderWorkspaceRoles({
        appEnv: "prod",
        hasDatabaseUrl: true,
        isFounder: true,
      }),
    ).toBe(false);
  });
});
