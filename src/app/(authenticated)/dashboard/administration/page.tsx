import type { Metadata } from "next";
import { AdministrationPlaceholder } from "@/features/dashboard/components/AdministrationPlaceholder";
import { getDashboardViewMode } from "@/features/dashboard/view-mode";
import { isFounder, isPlatformRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Administration" };

export default async function AdministrationPage() {
  const session = await requireSession();
  const platformUser = isPlatformRole(session.user.role)
    ? { role: session.user.role }
    : null;
  const founder = isFounder(platformUser);
  const viewMode = await getDashboardViewMode({ isFounder: founder });
  const canCreateAdmins =
    env.APP_ENV === "staging" && Boolean(env.DATABASE_URL);
  const workspaces = canCreateAdmins
    ? await (
        await import("@/features/workspace/service")
      ).getAdministrationWorkspaceOptions()
    : [];
  const CreateAdminForm =
    canCreateAdmins && workspaces.length > 0
      ? (await import("@/features/dashboard/components/CreateAdminForm"))
          .CreateAdminForm
      : null;

  return (
    <AdministrationPlaceholder
      isFounder={founder}
      viewMode={viewMode}
      canCreateAdmins={canCreateAdmins}
      workspaces={workspaces}
      createAdminForm={
        CreateAdminForm ? <CreateAdminForm workspaces={workspaces} /> : null
      }
    />
  );
}
