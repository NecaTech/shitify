import "server-only";
import { cookies } from "next/headers";
import { isWorkspaceRole, workspaceRoles } from "@/features/workspace/roles";
import type { WorkspaceRole } from "@/features/workspace/roles";

export const DASHBOARD_VIEW_COOKIE = "necatech_dashboard_view";
export const dashboardViewModes = ["founder", ...workspaceRoles] as const;
export type DashboardViewMode = (typeof dashboardViewModes)[number];
export type DashboardWorkspaceViewMode = Exclude<DashboardViewMode, "founder">;

export function isDashboardViewMode(
  value: unknown,
): value is DashboardViewMode {
  return value === "founder" || isWorkspaceRole(value);
}

export function getWorkspaceRoleFromDashboardView(
  viewMode: DashboardViewMode,
): WorkspaceRole | null {
  return viewMode === "founder" ? null : viewMode;
}

export async function getDashboardViewMode({
  isFounder,
}: {
  isFounder: boolean;
}): Promise<DashboardViewMode> {
  if (!isFounder) return "admin";

  const cookieStore = await cookies();
  const value = cookieStore.get(DASHBOARD_VIEW_COOKIE)?.value;
  return isDashboardViewMode(value) ? value : "founder";
}
