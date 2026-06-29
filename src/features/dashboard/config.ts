import { Gauge, Shield } from "lucide-react";
import { workspaceRoleAtLeast } from "@/features/workspace/roles";
import type { DashboardNavItem } from "./types";
import type { DashboardViewMode } from "./view-mode";

export const dashboardNavigation: DashboardNavItem[] = [
  {
    type: "link",
    label: "Pilote",
    href: "/dashboard",
    icon: Gauge,
    visible: true,
  },
  {
    type: "link",
    label: "Administration",
    href: "/dashboard/administration",
    icon: Shield,
    visible: true,
    minimumWorkspaceRole: "admin",
  },
];

export function getVisibleDashboardLinks(viewMode: DashboardViewMode) {
  return dashboardNavigation.flatMap((item) => {
    if (!item.visible) return [];
    if (item.type === "link") {
      if (!canViewDashboardItem(item, viewMode)) return [];
      return [item];
    }
    return item.items.filter(
      (child) => child.visible && canViewDashboardItem(child, viewMode),
    );
  });
}

function canViewDashboardItem(
  item: DashboardNavItem,
  viewMode: DashboardViewMode,
) {
  if (viewMode === "founder") return true;
  if (!item.minimumWorkspaceRole) return true;
  return workspaceRoleAtLeast(viewMode, item.minimumWorkspaceRole);
}

export function getDashboardRouteTitle(
  pathname: string,
  viewMode: DashboardViewMode = "founder",
) {
  const visibleLinks = getVisibleDashboardLinks(viewMode);

  return (
    visibleLinks.find((item) => {
      if (item.href === "/dashboard") return pathname === item.href;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })?.label ?? "Dashboard"
  );
}
