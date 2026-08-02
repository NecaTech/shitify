import { headers } from "next/headers";
import { isLocalAuthEnabled } from "@/lib/auth/local";
import { isFounder, isPlatformRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { getDashboardRouteTitle } from "../config";
import { getDashboardViewMode, getDashboardViewOptions } from "../view-mode";
import {
  loadFounderWorkspaceRolesSafely,
  shouldLoadFounderWorkspaceRoles,
} from "../workspace-role-loading";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardBottomNav, DashboardSidebar } from "./DashboardNav";

type DashboardShellProps = {
  children: React.ReactNode;
};

export async function DashboardShell({ children }: DashboardShellProps) {
  const [session, headersList] = await Promise.all([
    requireSession(),
    headers(),
  ]);
  const pathname = headersList.get("x-current-path") ?? "/dashboard";
  const platformUser = isPlatformRole(session.user.role)
    ? { role: session.user.role }
    : null;
  const founder = isFounder(platformUser);
  const customRoles = shouldLoadFounderWorkspaceRoles({
    appEnv: env.APP_ENV,
    hasDatabaseUrl: Boolean(env.DATABASE_URL),
    isFounder: founder,
  })
    ? await loadFounderWorkspaceRolesSafely()
    : [];
  const viewOptions = getDashboardViewOptions(customRoles);
  const viewMode = await getDashboardViewMode({
    isFounder: founder,
    roles: customRoles,
  });

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <DashboardSidebar viewMode={viewMode} viewOptions={viewOptions} />
      <div className="flex min-h-dvh flex-col pb-16 lg:pb-0 lg:pl-64">
        <DashboardHeader
          title={getDashboardRouteTitle(pathname, viewMode, viewOptions)}
          userName={session.user.name}
          isFounder={founder}
          viewMode={viewMode}
          viewOptions={viewOptions}
          localAuthEnabled={isLocalAuthEnabled()}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
      <DashboardBottomNav viewMode={viewMode} viewOptions={viewOptions} />
    </div>
  );
}
