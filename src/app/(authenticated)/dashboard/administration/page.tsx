import type { Metadata } from "next";
import { AdministrationPlaceholder } from "@/features/dashboard/components/AdministrationPlaceholder";
import {
  getDashboardViewMode,
  getDashboardViewOptions,
} from "@/features/dashboard/view-mode";
import { loadAdministrationWorkspaceDataSafely } from "@/features/dashboard/workspace-role-loading";
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
  const canManageWorkspaces = founder && canPersistRoles;
  const { workspaces, customRoles, members } =
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
  const admins = members.filter((member) => member.bootstrapRole === "admin");
  const AdminManagement =
    isFounderAdministration && canManageAdmins && workspaces.length > 0
      ? (await import("@/features/dashboard/components/AdminManagement"))
          .AdminManagement
      : null;
  const WorkspaceManagement =
    isFounderAdministration && canManageWorkspaces
      ? (await import("@/features/dashboard/components/WorkspaceManagement"))
          .WorkspaceManagement
      : null;
  const RoleManagement =
    isFounderAdministration && canCreateRoles && workspaces.length > 0
      ? (await import("@/features/dashboard/components/RoleManagement"))
          .RoleManagement
      : null;
  const MemberManagement =
    !isFounderAdministration && canPersistRoles && workspaces.length > 0
      ? (await import("@/features/dashboard/components/MemberManagement"))
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
      canCreateRoles={canCreateRoles}
      canPersistRoles={canPersistRoles}
      canManageAdmins={canManageAdmins}
      canManageWorkspaces={canManageWorkspaces}
      workspaces={workspaces}
      memberManagement={
        MemberManagement ? (
          <MemberManagement
            workspaces={workspaces}
            members={workspaceMembers}
            customRoles={customRoles}
          />
        ) : null
      }
      adminManagement={
        AdminManagement ? (
          <AdminManagement workspaces={workspaces} admins={admins} />
        ) : null
      }
      workspaceManagement={
        WorkspaceManagement ? (
          <WorkspaceManagement workspaces={workspaces} />
        ) : null
      }
      roleManagement={
        RoleManagement ? (
          <RoleManagement workspaces={workspaces} customRoles={customRoles} />
        ) : null
      }
    />
  );
}
