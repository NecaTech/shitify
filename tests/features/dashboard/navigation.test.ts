import { existsSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  dashboardNavigation,
  getVisibleDashboardLinks,
  getDashboardRouteTitle,
} from "@/features/dashboard/config";

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
      getVisibleDashboardLinks("founder").map((item) => item.href),
    ).toEqual(["/dashboard", "/dashboard/administration"]);
    expect(getVisibleDashboardLinks("admin").map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard/administration",
    ]);
    expect(
      getVisibleDashboardLinks("manager").map((item) => item.href),
    ).toEqual(["/dashboard"]);
    expect(getDashboardRouteTitle("/dashboard/administration", "viewer")).toBe(
      "Dashboard",
    );
  });
});
