import { Database, ShieldCheck, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  workspaceRoleAtLeast,
  workspaceRoleDefinitions,
} from "@/features/workspace/roles";
import type { WorkspaceSummary } from "@/features/workspace/types";
import type { DashboardViewMode } from "../view-mode";

type AdministrationPlaceholderProps = {
  isFounder: boolean;
  viewMode: DashboardViewMode;
  canCreateAdmins: boolean;
  workspaces: WorkspaceSummary[];
  createAdminForm?: ReactNode;
};

export function AdministrationPlaceholder({
  isFounder,
  viewMode,
  canCreateAdmins,
  workspaces,
  createAdminForm,
}: AdministrationPlaceholderProps) {
  const canViewAdministration =
    viewMode === "founder" || workspaceRoleAtLeast(viewMode, "admin");
  const roleLabel =
    viewMode === "founder"
      ? "Founder"
      : workspaceRoleDefinitions[viewMode].label;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="border-border bg-card text-card-foreground rounded-lg border p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="bg-muted inline-flex size-10 items-center justify-center rounded-lg">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Administration
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
              {canViewAdministration
                ? `Perspective ${roleLabel} : gérez ou vérifiez les vues d'administration autorisées.`
                : `Perspective ${roleLabel} : cette vue n'est pas autorisée dans la navigation de ce rôle.`}
            </p>
          </div>
          {isFounder && canViewAdministration ? (
            <Button disabled={!canCreateAdmins || workspaces.length === 0}>
              <UserPlus aria-hidden="true" />
              Créer un admin
            </Button>
          ) : null}
        </div>
      </section>

      {isFounder && canViewAdministration ? (
        <section className="border-border rounded-lg border p-5">
          <div className="mb-5 flex items-start gap-3">
            <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
              {canCreateAdmins ? (
                <UserPlus aria-hidden="true" className="size-4" />
              ) : (
                <Database aria-hidden="true" className="size-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold">Créer un admin</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {canCreateAdmins
                  ? "Créez un compte utilisateur et rattachez-le comme admin au workspace choisi."
                  : "La création d'admins est disponible uniquement en phase staging, après configuration de la DB Neon, migrations et seed founder."}
              </p>
            </div>
          </div>

          {canCreateAdmins && workspaces.length > 0 ? createAdminForm : null}

          {canCreateAdmins && workspaces.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucun workspace disponible. Lancez le seed founder après les
              migrations pour créer le workspace initial.
            </p>
          ) : null}
        </section>
      ) : null}

      {!canViewAdministration ? (
        <section className="border-border rounded-lg border p-5">
          <h2 className="text-base font-semibold">Accès non autorisé</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            La perspective sélectionnée ne dispose pas des droits nécessaires
            pour voir l'administration workspace.
          </p>
        </section>
      ) : null}
    </div>
  );
}
