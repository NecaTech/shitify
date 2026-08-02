import "server-only";
import { cookies } from "next/headers";
import type { WorkspaceCustomRoleSummary } from "@/features/workspace/types";

export const DASHBOARD_VIEW_COOKIE = "necatech_dashboard_view";
export type DashboardViewMode =
  | "founder"
  | "admin"
  | "member"
  | `role:${string}`;

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
  {
    mode: "member",
    label: "Member",
    permissions: { navigation: ["dashboard"] },
  },
] as const satisfies readonly DashboardViewOption[];

export function isDashboardViewMode(
  value: unknown,
): value is DashboardViewMode {
  return (
    value === "founder" ||
    value === "admin" ||
    value === "member" ||
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
  // A platform user is never implicitly a workspace admin. Until its active
  // workspace membership is resolved, it receives only the fail-closed member
  // perspective.
  if (!isFounder) return "member";

  const cookieStore = await cookies();
  const value = cookieStore.get(DASHBOARD_VIEW_COOKIE)?.value;
  const options = getDashboardViewOptions(roles);
  return isDashboardViewMode(value) &&
    options.some((option) => option.mode === value)
    ? value
    : "founder";
}
