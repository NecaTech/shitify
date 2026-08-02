"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Settings2, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createWorkspaceAdminAction,
  deleteWorkspaceAdminAction,
  updateWorkspaceAdminAction,
} from "@/features/workspace/actions";
import type {
  WorkspaceMemberRoleSummary,
  WorkspaceSummary,
} from "@/features/workspace/types";
import { ConfirmDialog } from "./ConfirmDialog";

type AdminManagementProps = {
  workspace: WorkspaceSummary;
  admins: WorkspaceMemberRoleSummary[];
};

type EditingAdmin = WorkspaceMemberRoleSummary | null;

export function AdminManagement({ workspace, admins }: AdminManagementProps) {
  const router = useRouter();
  const [editingAdmin, setEditingAdmin] = useState<EditingAdmin>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateDialog() {
    setEditingAdmin(null);
    setName("");
    setEmail("");
    setInitialPassword("");
    setIsConfirmingDelete(false);
    setError(null);
    setIsOpen(true);
  }

  function openAdminDialog(admin: WorkspaceMemberRoleSummary) {
    setEditingAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setInitialPassword("");
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
      const result = editingAdmin
        ? await updateWorkspaceAdminAction({
            membershipId: editingAdmin.membershipId,
            workspaceId: workspace.id,
            name,
            email,
          })
        : await createWorkspaceAdminAction({
            workspaceId: workspace.id,
            name,
            email,
            initialPassword,
          });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!editingAdmin) return;
    setError(null);

    startTransition(async () => {
      const result = await deleteWorkspaceAdminAction({
        membershipId: editingAdmin.membershipId,
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
          <h2 className="text-base font-semibold">Admins workspace</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Créez et configurez les admins rattachés à la workspace du projet.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <UserPlus aria-hidden="true" />
          Créer un admin
        </Button>
      </div>

      {admins.length > 0 ? (
        <div className="grid gap-2">
          {admins.map((admin) => (
            <button
              key={admin.membershipId}
              type="button"
              onClick={() => openAdminDialog(admin)}
              className="border-border hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{admin.name}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {admin.email} · {workspace.name}
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
          Aucun admin workspace n'est encore enregistré.
        </p>
      )}

      {isOpen ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dialog-title"
            className="bg-card text-card-foreground border-border w-full max-w-xl rounded-lg border shadow-lg"
          >
            <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
              <h3 id="admin-dialog-title" className="text-base font-semibold">
                {editingAdmin ? "Configurer l'admin" : "Créer un admin"}
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
                <label htmlFor="admin-name" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="admin-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="admin-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {!editingAdmin ? (
                <div className="grid gap-1">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-medium"
                  >
                    Mot de passe initial
                  </label>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    value={initialPassword}
                    onChange={(event) => setInitialPassword(event.target.value)}
                  />
                </div>
              ) : null}

              {error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : null}

              <div className="flex flex-wrap justify-between gap-2">
                {editingAdmin ? (
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
                      : editingAdmin
                        ? "Enregistrer"
                        : "Créer l'admin"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {isConfirmingDelete && editingAdmin ? (
            <ConfirmDialog
              title="Supprimer cet admin ?"
              description={`L'admin ${editingAdmin.name} sera retiré de ce workspace. Le compte utilisateur global ne sera pas supprimé.`}
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
