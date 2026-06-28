import type { LucideIcon } from "lucide-react";

type DashboardNavBase = {
  label: string;
  icon: LucideIcon;
  visible: boolean;
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
