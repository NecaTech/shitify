import type { Metadata } from "next";
import { PiloteHome } from "@/features/dashboard/components/PiloteHome";
import { getDashboardViewMode } from "@/features/dashboard/view-mode";
import { isLocalAuthEnabled } from "@/lib/auth/local";
import { isFounder, isPlatformRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Pilote" };

export default async function DashboardPage() {
  const session = await requireSession();
  const platformUser = isPlatformRole(session.user.role)
    ? { role: session.user.role }
    : null;
  const founder = isFounder(platformUser);
  const viewMode = await getDashboardViewMode({ isFounder: founder });

  return (
    <PiloteHome
      viewMode={viewMode}
      appEnv={env.APP_ENV}
      localAuthEnabled={isLocalAuthEnabled()}
      hasDatabaseUrl={Boolean(env.DATABASE_URL)}
    />
  );
}
