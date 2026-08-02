import { Gauge, Settings, Shield } from "lucide-react";
import type { DashboardNavItem, DashboardNavLink } from "./types";
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
    type: "group",
    label: "Gestion",
    icon: Settings,
    visible: true,
    items: [
      {
        type: "link",
        label: "Administration",
        href: "/administration",
        icon: Shield,
        visible: true,
        permission: "administration",
      },
    ],
  },
];

export function getVisibleDashboardNavigation(
  viewMode: DashboardViewMode,
  viewOptions: readonly DashboardViewOption[],
): DashboardNavItem[] {
  const navigation: DashboardNavItem[] = [];

  for (const item of dashboardNavigation) {
    if (!item.visible) continue;
    if (item.type === "link") {
      if (canViewDashboardPermission(item.permission, viewMode, viewOptions)) {
        navigation.push(item);
      }
      continue;
    }

    const items = item.items.filter(
      (child) =>
        child.visible &&
        canViewDashboardPermission(child.permission, viewMode, viewOptions),
    );
    if (items.length > 0) navigation.push({ ...item, items });
  }

  return navigation;
}

export function getVisibleDashboardLinks(
  viewMode: DashboardViewMode,
  viewOptions: readonly DashboardViewOption[],
) {
  return getVisibleDashboardNavigation(viewMode, viewOptions).flatMap((item) =>
    item.type === "link" ? [item] : item.items,
  );
}

export function canViewDashboardPermission(
  permission: DashboardNavLink["permission"],
  viewMode: DashboardViewMode,
  viewOptions: readonly DashboardViewOption[],
) {
  if (viewMode === "founder") return true;
  const option = viewOptions.find((candidate) => candidate.mode === viewMode);
  return option?.permissions?.navigation.includes(permission) ?? false;
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
