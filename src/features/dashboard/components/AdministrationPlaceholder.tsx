import { Database } from "lucide-react";
import type { ReactNode } from "react";
import type { WorkspaceSummary } from "@/features/workspace/types";
import type { DashboardViewMode, DashboardViewOption } from "../view-mode";

type AdministrationPlaceholderProps = {
  isFounder: boolean;
  viewMode: DashboardViewMode;
  viewOptions: DashboardViewOption[];
  canCreateRoles: boolean;
  canPersistRoles: boolean;
  canManageAdmins: boolean;
  canManageWorkspaces: boolean;
  workspaces: WorkspaceSummary[];
  memberManagement?: ReactNode;
  adminManagement?: ReactNode;
  workspaceManagement?: ReactNode;
  roleManagement?: ReactNode;
};

export function AdministrationPlaceholder({
  isFounder,
  viewMode,
  viewOptions,
  canCreateRoles,
  canPersistRoles,
  canManageAdmins,
  canManageWorkspaces,
  workspaces,
  memberManagement,
  adminManagement,
  workspaceManagement,
  roleManagement,
}: AdministrationPlaceholderProps) {
  const selectedView = viewOptions.find((option) => option.mode === viewMode);
  const canViewAdministration =
    viewMode === "founder" ||
    (selectedView?.permissions?.navigation.includes("administration") ?? false);

  if (!canViewAdministration) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>

      {isFounder ? (
        <section className="border-border rounded-lg border p-5">
          {canManageAdmins && workspaces.length > 0 ? adminManagement : null}

          {canManageAdmins && workspaces.length === 0 ? (
            <div className="flex items-start gap-3">
              <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Database aria-hidden="true" className="size-4" />
              </div>
              <p className="text-muted-foreground text-sm">
                Aucun workspace disponible. Vérifiez la connexion DB, appliquez
                les migrations, puis lancez le seed founder pour créer le
                workspace initial.
              </p>
            </div>
          ) : null}

          {!canManageAdmins ? (
            <div className="flex items-start gap-3">
              <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Database aria-hidden="true" className="size-4" />
              </div>
              <p className="text-muted-foreground text-sm">
                Configurez une DB en phase dev ou staging pour créer et
                configurer les admins workspace.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {!isFounder ? (
        <section className="border-border rounded-lg border p-5">
          {canPersistRoles && workspaces.length > 0 ? memberManagement : null}

          {canPersistRoles && workspaces.length === 0 ? (
            <div className="flex items-start gap-3">
              <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Database aria-hidden="true" className="size-4" />
              </div>
              <p className="text-muted-foreground text-sm">
                Aucun workspace disponible pour cet admin.
              </p>
            </div>
          ) : null}

          {!canPersistRoles ? (
            <div className="flex items-start gap-3">
              <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Database aria-hidden="true" className="size-4" />
              </div>
              <p className="text-muted-foreground text-sm">
                Configurez une DB en phase dev ou staging pour gérer les membres
                workspace.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {isFounder ? (
        <section className="border-border rounded-lg border p-5">
          {canManageWorkspaces ? workspaceManagement : null}

          {!canManageWorkspaces ? (
            <div className="flex items-start gap-3">
              <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Database aria-hidden="true" className="size-4" />
              </div>
              <p className="text-muted-foreground text-sm">
                Configurez une DB en phase dev ou staging pour créer et
                configurer les workspaces.
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {isFounder ? (
        <section className="border-border rounded-lg border p-5">
          {canPersistRoles && workspaces.length > 0 ? roleManagement : null}

          {canPersistRoles && workspaces.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucun workspace disponible. Créez un workspace avant de créer des
              rôles.
            </p>
          ) : null}

          {!canPersistRoles ? (
            <div className="flex items-start gap-3">
              <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Database aria-hidden="true" className="size-4" />
              </div>
              <p className="text-muted-foreground text-sm">
                {canCreateRoles
                  ? "Configurez la DB en phase dev ou staging pour créer et configurer les rôles workspace."
                  : "La configuration des rôles est disponible en phase dev ou staging."}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
