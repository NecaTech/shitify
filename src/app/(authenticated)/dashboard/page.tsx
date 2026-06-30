import type { Metadata } from "next";
import { PiloteHome } from "@/features/dashboard/components/PiloteHome";
import {
  getDashboardViewMode,
  getDashboardViewOptions,
} from "@/features/dashboard/view-mode";
import {
  loadFounderWorkspaceRolesSafely,
  shouldLoadFounderWorkspaceRoles,
} from "@/features/dashboard/workspace-role-loading";
import { isLocalAuthEnabled } from "@/lib/auth/local";
import { isFounder, isPlatformRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { classifyDatabaseUrl } from "@/lib/db/database-url";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Pilote" };

export default async function DashboardPage() {
  const session = await requireSession();
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
    <PiloteHome
      viewMode={viewMode}
      viewOptions={viewOptions}
      appEnv={env.APP_ENV}
      localAuthEnabled={isLocalAuthEnabled()}
      hasDatabaseUrl={Boolean(env.DATABASE_URL)}
      databaseKind={
        env.DATABASE_URL ? classifyDatabaseUrl(new URL(env.DATABASE_URL)) : null
      }
      isFounder={founder}
    />
  );
}
