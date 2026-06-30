"use client";

import { useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Settings2, ShieldPlus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createWorkspaceCustomRoleAction,
  deleteWorkspaceCustomRoleAction,
  updateWorkspaceCustomRoleAction,
} from "@/features/workspace/actions";
import type { DashboardNavigationPermission } from "@/features/workspace/roles";
import type {
  WorkspaceCustomRoleSummary,
  WorkspaceSummary,
} from "@/features/workspace/types";
import { ConfirmDialog } from "./ConfirmDialog";

type RoleManagementProps = {
  workspaces: WorkspaceSummary[];
  customRoles: WorkspaceCustomRoleSummary[];
};

type EditingRole = WorkspaceCustomRoleSummary | null;

const navigationOptions = [
  { value: "dashboard", label: "Pilote" },
  { value: "administration", label: "Administration" },
] as const satisfies readonly {
  value: DashboardNavigationPermission;
  label: string;
}[];

function getInitialNavigation(
  role: EditingRole,
): DashboardNavigationPermission[] {
  return role?.permissions.navigation.length
    ? role.permissions.navigation
    : ["dashboard"];
}

export function RoleManagement({
  workspaces,
  customRoles,
}: RoleManagementProps) {
  const router = useRouter();
  const [editingRole, setEditingRole] = useState<EditingRole>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [navigation, setNavigation] = useState<DashboardNavigationPermission[]>(
    ["dashboard"],
  );
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const workspaceById = useMemo(
    () => new Map(workspaces.map((workspace) => [workspace.id, workspace])),
    [workspaces],
  );

  function openCreateDialog() {
    setEditingRole(null);
    setWorkspaceId(workspaces[0]?.id ?? "");
    setName("");
    setDescription("");
    setNavigation(["dashboard"]);
    setIsConfirmingDelete(false);
    setError(null);
    setIsOpen(true);
  }

  function openRoleDialog(role: WorkspaceCustomRoleSummary) {
    setEditingRole(role);
    setWorkspaceId(role.workspaceId);
    setName(role.name);
    setDescription(role.description ?? "");
    setNavigation(getInitialNavigation(role));
    setIsConfirmingDelete(false);
    setError(null);
    setIsOpen(true);
  }

  function closeDialog() {
    if (isPending) return;
    setIsOpen(false);
    setIsConfirmingDelete(false);
    setError(null);
  }

  function toggleNavigation(permission: DashboardNavigationPermission) {
    setNavigation((current) => {
      if (current.includes(permission)) {
        const next = current.filter((item) => item !== permission);
        return next.length > 0 ? next : current;
      }
      return [...current, permission];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = {
        workspaceId,
        name,
        description,
        navigation,
      };
      const result = editingRole
        ? await updateWorkspaceCustomRoleAction({
            ...payload,
            roleId: editingRole.id,
          })
        : await createWorkspaceCustomRoleAction(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!editingRole) return;
    setError(null);

    startTransition(async () => {
      const result = await deleteWorkspaceCustomRoleAction({
        roleId: editingRole.id,
      });
      if (!result.success) {
        setError(result.error);
        setIsConfirmingDelete(false);
        return;
      }
      setIsOpen(false);
      setIsConfirmingDelete(false);
      router.refresh();
    });
  }

  const title = editingRole ? "Configurer le rôle" : "Créer un rôle";
  const selectedWorkspace = workspaceById.get(workspaceId);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Rôles workspace</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Les rôles créés deviennent disponibles dans les perspectives du
            dashboard.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateDialog}
          disabled={workspaces.length === 0}
        >
          <ShieldPlus aria-hidden="true" />
          Créer un rôle
        </Button>
      </div>

      {customRoles.length > 0 ? (
        <div className="grid gap-2">
          {customRoles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => openRoleDialog(role)}
              className="border-border hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{role.name}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {workspaceById.get(role.workspaceId)?.name ?? "Workspace"} ·{" "}
                  {role.permissions.navigation.join(", ")}
                </span>
              </span>
              <Settings2
                aria-hidden="true"
                className="text-muted-foreground size-4 shrink-0"
              />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Aucun rôle personnalisé n'a encore été créé.
        </p>
      )}

      {isOpen ? (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-dialog-title"
            className="bg-card text-card-foreground border-border w-full max-w-xl rounded-lg border shadow-lg"
          >
            <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
              <div>
                <h3 id="role-dialog-title" className="text-base font-semibold">
                  {title}
                </h3>
                {selectedWorkspace ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Workspace: {selectedWorkspace.name}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={closeDialog}
                aria-label="Fermer"
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-5">
              <div className="grid gap-1">
                <label htmlFor="role-workspace" className="text-sm font-medium">
                  Workspace
                </label>
                <select
                  id="role-workspace"
                  required
                  value={workspaceId}
                  disabled={Boolean(editingRole)}
                  onChange={(event) => setWorkspaceId(event.target.value)}
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1">
                <label htmlFor="role-name" className="text-sm font-medium">
                  Nom du rôle
                </label>
                <Input
                  id="role-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <label
                  htmlFor="role-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <Input
                  id="role-description"
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">Vues autorisées</legend>
                <div className="flex flex-wrap gap-2">
                  {navigationOptions.map((option) => (
                    <label
                      key={option.value}
                      className="border-border flex h-8 items-center gap-2 rounded-lg border px-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={navigation.includes(option.value)}
                        onChange={() => toggleNavigation(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : null}

              <div className="flex flex-wrap justify-between gap-2">
                {editingRole ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsConfirmingDelete(true)}
                    disabled={isPending}
                  >
                    <Trash2 aria-hidden="true" />
                    Supprimer
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || workspaces.length === 0}
                  >
                    {isPending
                      ? "Enregistrement..."
                      : editingRole
                        ? "Enregistrer"
                        : "Créer le rôle"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {isConfirmingDelete && editingRole ? (
            <ConfirmDialog
              title="Supprimer ce rôle ?"
              description={`Le rôle ${editingRole.name} sera supprimé et ne pourra plus être assigné aux membres.`}
              disabled={isPending}
              onCancel={() => setIsConfirmingDelete(false)}
              onConfirm={handleDelete}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
