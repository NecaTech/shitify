import { Gauge, Shield } from "lucide-react";
import type { DashboardNavItem } from "./types";
import type { DashboardViewMode, DashboardViewOption } from "./view-mode";

export const dashboardNavigation: DashboardNavItem[] = [
  {
    type: "link",
    label: "Pilote",
    href: "/dashboard",
    icon: Gauge,
    visible: true,
    permission: "dashboard",
  },
  {
    type: "link",
    label: "Administration",
    href: "/dashboard/administration",
    icon: Shield,
    visible: true,
    permission: "administration",
  },
];

export function getVisibleDashboardLinks(
  viewMode: DashboardViewMode,
  viewOptions: readonly DashboardViewOption[],
) {
  return dashboardNavigation.flatMap((item) => {
    if (!item.visible) return [];
    if (item.type === "link") {
      if (!canViewDashboardItem(item, viewMode, viewOptions)) return [];
      return [item];
    }
    return item.items.filter(
      (child) =>
        child.visible && canViewDashboardItem(child, viewMode, viewOptions),
    );
  });
}

function canViewDashboardItem(
  item: DashboardNavItem,
  viewMode: DashboardViewMode,
  viewOptions: readonly DashboardViewOption[],
) {
  if (viewMode === "founder") return true;
  const option = viewOptions.find((candidate) => candidate.mode === viewMode);
  return option?.permissions?.navigation.includes(item.permission) ?? false;
}

export function getDashboardRouteTitle(
  pathname: string,
  viewMode: DashboardViewMode = "founder",
  viewOptions: readonly DashboardViewOption[] = [],
) {
  const visibleLinks = getVisibleDashboardLinks(viewMode, viewOptions);

  return (
    visibleLinks.find((item) => {
      if (item.href === "/dashboard") return pathname === item.href;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })?.label ?? "Dashboard"
  );
}
