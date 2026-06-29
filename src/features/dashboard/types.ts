import type { LucideIcon } from "lucide-react";
import type { WorkspaceRole } from "@/features/workspace/roles";

type DashboardNavBase = {
  label: string;
  icon: LucideIcon;
  visible: boolean;
  minimumWorkspaceRole?: WorkspaceRole;
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
