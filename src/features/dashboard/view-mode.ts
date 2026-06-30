import "server-only";
import { cookies } from "next/headers";
import type { WorkspaceCustomRoleSummary } from "@/features/workspace/types";

export const DASHBOARD_VIEW_COOKIE = "necatech_dashboard_view";
export type DashboardViewMode = "founder" | "admin" | `role:${string}`;

export type DashboardViewOption = {
  mode: DashboardViewMode;
  label: string;
  permissions: WorkspaceCustomRoleSummary["permissions"] | null;
};

export const baseDashboardViewOptions = [
  {
    mode: "founder",
    label: "Founder",
    permissions: null,
  },
  {
    mode: "admin",
    label: "Admin",
    permissions: { navigation: ["dashboard", "administration"] },
  },
] as const satisfies readonly DashboardViewOption[];

export function isDashboardViewMode(
  value: unknown,
): value is DashboardViewMode {
  return (
    value === "founder" ||
    value === "admin" ||
    (typeof value === "string" && value.startsWith("role:"))
  );
}

export function getDashboardViewOptions(
  roles: WorkspaceCustomRoleSummary[],
): DashboardViewOption[] {
  return [
    ...baseDashboardViewOptions,
    ...roles.map((role) => ({
      mode: `role:${role.id}` as const,
      label: role.name,
      permissions: role.permissions,
    })),
  ];
}

export async function getDashboardViewMode({
  isFounder,
  roles = [],
}: {
  isFounder: boolean;
  roles?: WorkspaceCustomRoleSummary[];
}): Promise<DashboardViewMode> {
  if (!isFounder) return "admin";

  const cookieStore = await cookies();
  const value = cookieStore.get(DASHBOARD_VIEW_COOKIE)?.value;
  const options = getDashboardViewOptions(roles);
  return isDashboardViewMode(value) &&
    options.some((option) => option.mode === value)
    ? value
    : "founder";
}
