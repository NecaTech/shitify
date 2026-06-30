import type { LucideIcon } from "lucide-react";
import type { DashboardNavigationPermission } from "@/features/workspace/roles";

type DashboardNavBase = {
  label: string;
  icon: LucideIcon;
  visible: boolean;
  permission: DashboardNavigationPermission;
};

export type DashboardNavLink = DashboardNavBase & {
  type: "link";
  href: string;
};

export type DashboardNavGroup = DashboardNavBase & {
  type: "group";
  items: DashboardNavLink[];
};

export type DashboardNavItem = DashboardNavLink | DashboardNavGroup;
