import type { LucideIcon } from "lucide-react";
import type { DashboardNavigationPermission } from "@/features/workspace/roles";

type DashboardNavBase = {
  label: string;
  icon: LucideIcon;
  visible: boolean;
};

export type DashboardNavLink = DashboardNavBase & {
  type: "link";
  href: string;
  permission: DashboardNavigationPermission;
};

export type DashboardNavGroup = DashboardNavBase & {
  type: "group";
  items: DashboardNavLink[];
};

export type DashboardNavItem = DashboardNavLink | DashboardNavGroup;
