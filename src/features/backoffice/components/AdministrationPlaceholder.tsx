import { Database } from "lucide-react";
import type { ReactNode } from "react";
import type { WorkspaceSummary } from "@/features/workspace/types";
import type { DashboardViewMode, DashboardViewOption } from "../view-mode";

type AdministrationPlaceholderProps = {
  isFounder: boolean;
  viewMode: DashboardViewMode;
  viewOptions: DashboardViewOption[];
  canPersistRoles: boolean;
  canManageAdmins: boolean;
  workspace: WorkspaceSummary | null;
  memberManagement?: ReactNode;
  adminManagement?: ReactNode;
  roleManagement?: ReactNode;
};

export function AdministrationPlaceholder({
  isFounder,
  viewMode,
  viewOptions,
  canPersistRoles,
  canManageAdmins,
  workspace,
  memberManagement,
  adminManagement,
  roleManagement,
}: AdministrationPlaceholderProps) {
  const selectedView = viewOptions.find((option) => option.mode === viewMode);
  const canViewAdministration =
    viewMode === "founder" ||
    (selectedView?.permissions?.navigation.includes("administration") ?? false);

  if (!canViewAdministration) return null;

  const missingWorkspace = (
    <div className="flex items-start gap-3">
      <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Database aria-hidden="true" className="size-4" />
      </div>
      <p className="text-muted-foreground text-sm">
        Aucune workspace initiale disponible. Vérifiez la connexion DB,
        appliquez les migrations, puis lancez le seed du projet.
      </p>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>

      {isFounder ? (
        <section className="border-border rounded-lg border p-5">
          {canManageAdmins && workspace ? adminManagement : null}
          {canManageAdmins && !workspace ? missingWorkspace : null}
          {!canManageAdmins ? (
            <p className="text-muted-foreground text-sm">
              Configurez une DB en phase dev ou staging pour gérer les admins.
            </p>
          ) : null}
        </section>
      ) : (
        <section className="border-border rounded-lg border p-5">
          {canPersistRoles && workspace ? memberManagement : null}
          {canPersistRoles && !workspace ? missingWorkspace : null}
          {!canPersistRoles ? (
            <p className="text-muted-foreground text-sm">
              Configurez une DB en phase dev ou staging pour gérer les membres.
            </p>
          ) : null}
        </section>
      )}

      {isFounder ? (
        <section className="border-border rounded-lg border p-5">
          {canPersistRoles && workspace ? roleManagement : null}
          {canPersistRoles && !workspace ? missingWorkspace : null}
          {!canPersistRoles ? (
            <p className="text-muted-foreground text-sm">
              La configuration des rôles est disponible en phase dev ou staging.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
