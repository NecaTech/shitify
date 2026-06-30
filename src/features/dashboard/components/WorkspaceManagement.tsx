"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Settings2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createWorkspaceAction,
  deleteWorkspaceAction,
  updateWorkspaceAction,
} from "@/features/workspace/actions";
import type { WorkspaceSummary } from "@/features/workspace/types";
import { ConfirmDialog } from "./ConfirmDialog";

type WorkspaceManagementProps = {
  workspaces: WorkspaceSummary[];
};

type EditingWorkspace = WorkspaceSummary | null;

export function WorkspaceManagement({ workspaces }: WorkspaceManagementProps) {
  const router = useRouter();
  const [editingWorkspace, setEditingWorkspace] =
    useState<EditingWorkspace>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateDialog() {
    setEditingWorkspace(null);
    setName("");
    setIsConfirmingDelete(false);
    setError(null);
    setIsOpen(true);
  }

  function openWorkspaceDialog(workspace: WorkspaceSummary) {
    setEditingWorkspace(workspace);
    setName(workspace.name);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = editingWorkspace
        ? await updateWorkspaceAction({
            workspaceId: editingWorkspace.id,
            name,
          })
        : await createWorkspaceAction({ name });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!editingWorkspace) return;
    setError(null);

    startTransition(async () => {
      const result = await deleteWorkspaceAction({
        workspaceId: editingWorkspace.id,
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

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Workspaces</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Créez et configurez les espaces de travail disponibles.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <BriefcaseBusiness aria-hidden="true" />
          Créer un workspace
        </Button>
      </div>

      {workspaces.length > 0 ? (
        <div className="grid gap-2">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              onClick={() => openWorkspaceDialog(workspace)}
              className="border-border hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {workspace.name}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {workspace.slug}
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
          Aucun workspace n'est encore enregistré.
        </p>
      )}

      {isOpen ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-dialog-title"
            className="bg-card text-card-foreground border-border w-full max-w-xl rounded-lg border shadow-lg"
          >
            <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
              <h3
                id="workspace-dialog-title"
                className="text-base font-semibold"
              >
                {editingWorkspace
                  ? "Configurer le workspace"
                  : "Créer un workspace"}
              </h3>
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
                <label htmlFor="workspace-name" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="workspace-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              {error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : null}

              <div className="flex flex-wrap justify-between gap-2">
                {editingWorkspace ? (
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
                  <Button type="submit" disabled={isPending}>
                    {isPending
                      ? "Enregistrement..."
                      : editingWorkspace
                        ? "Enregistrer"
                        : "Créer le workspace"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {isConfirmingDelete && editingWorkspace ? (
            <ConfirmDialog
              title="Supprimer ce workspace ?"
              description={`Le workspace ${editingWorkspace.name}, ses rôles et ses rattachements seront supprimés.`}
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
