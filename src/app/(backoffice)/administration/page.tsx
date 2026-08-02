import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdministrationPlaceholder } from "@/features/backoffice/components/AdministrationPlaceholder";
import { canViewDashboardPermission } from "@/features/backoffice/config";
import {
  getDashboardViewMode,
  getDashboardViewOptions,
} from "@/features/backoffice/view-mode";
import { loadAdministrationWorkspaceDataSafely } from "@/features/backoffice/workspace-role-loading";
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
  const canPersistRoles = env.APP_ENV !== "prod" && Boolean(env.DATABASE_URL);
  const canCreateRoles = founder && canPersistRoles;
  const canManageAdmins = founder && canPersistRoles;
  const { workspace, customRoles, members } =
    await loadAdministrationWorkspaceDataSafely({
      enabled: canPersistRoles,
      actorRole: platformUser?.role ?? "user",
      actorUserId: session.user.id,
    });
  const viewMode = await getDashboardViewMode({
    isFounder: founder,
    roles: customRoles,
  });
  const isFounderAdministration = founder && viewMode === "founder";
  const viewOptions = getDashboardViewOptions(customRoles);
  if (!canViewDashboardPermission("administration", viewMode, viewOptions)) {
    notFound();
  }
  const admins = members.filter((member) => member.bootstrapRole === "admin");
  const AdminManagement =
    isFounderAdministration && canManageAdmins && workspace
      ? (await import("@/features/backoffice/components/AdminManagement"))
          .AdminManagement
      : null;
  const RoleManagement =
    isFounderAdministration && canCreateRoles && workspace
      ? (await import("@/features/backoffice/components/RoleManagement"))
          .RoleManagement
      : null;
  const MemberManagement =
    !isFounderAdministration && canPersistRoles && workspace
      ? (await import("@/features/backoffice/components/MemberManagement"))
          .MemberManagement
      : null;
  const workspaceMembers = members.filter(
    (member) => member.bootstrapRole === "member",
  );

  return (
    <AdministrationPlaceholder
      isFounder={isFounderAdministration}
      viewMode={viewMode}
      viewOptions={viewOptions}
      canPersistRoles={canPersistRoles}
      canManageAdmins={canManageAdmins}
      workspace={workspace}
      memberManagement={
        MemberManagement ? (
          <MemberManagement
            workspace={workspace!}
            members={workspaceMembers}
            customRoles={customRoles}
          />
        ) : null
      }
      adminManagement={
        AdminManagement ? (
          <AdminManagement workspace={workspace!} admins={admins} />
        ) : null
      }
      roleManagement={
        RoleManagement ? (
          <RoleManagement workspace={workspace!} customRoles={customRoles} />
        ) : null
      }
    />
  );
}
