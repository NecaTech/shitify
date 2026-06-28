import { Gauge, Shield } from "lucide-react";
import type { DashboardNavItem } from "./types";

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
  },
];

export function getDashboardRouteTitle(pathname: string) {
  const visibleLinks = dashboardNavigation.flatMap((item) => {
    if (!item.visible) return [];
    if (item.type === "link") return [item];
    return item.items.filter((child) => child.visible);
  });

  return (
    visibleLinks.find((item) => {
      if (item.href === "/dashboard") return pathname === item.href;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })?.label ?? "Dashboard"
  );
}
