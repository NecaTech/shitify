"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Settings2, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createWorkspaceMemberAction,
  deleteWorkspaceMemberAction,
  updateWorkspaceMemberAction,
} from "@/features/workspace/actions";
import type {
  WorkspaceCustomRoleSummary,
  WorkspaceMemberRoleSummary,
  WorkspaceSummary,
} from "@/features/workspace/types";
import { ConfirmDialog } from "./ConfirmDialog";

type MemberManagementProps = {
  workspace: WorkspaceSummary;
  members: WorkspaceMemberRoleSummary[];
  customRoles: WorkspaceCustomRoleSummary[];
};

type EditingMember = WorkspaceMemberRoleSummary | null;

export function MemberManagement({
  workspace,
  members,
  customRoles,
}: MemberManagementProps) {
  const router = useRouter();
  const [editingMember, setEditingMember] = useState<EditingMember>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [customRoleId, setCustomRoleId] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateDialog() {
    setEditingMember(null);
    setName("");
    setEmail("");
    setInitialPassword("");
    setCustomRoleId("");
    setIsConfirmingDelete(false);
    setError(null);
    setIsOpen(true);
  }

  function openMemberDialog(member: WorkspaceMemberRoleSummary) {
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setInitialPassword("");
    setCustomRoleId(member.customRoleId ?? "");
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
      const payload = {
        workspaceId: workspace.id,
        name,
        email,
        customRoleId,
      };
      const result = editingMember
        ? await updateWorkspaceMemberAction({
            ...payload,
            membershipId: editingMember.membershipId,
          })
        : await createWorkspaceMemberAction({
            ...payload,
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
    if (!editingMember) return;
    setError(null);

    startTransition(async () => {
      const result = await deleteWorkspaceMemberAction({
        membershipId: editingMember.membershipId,
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
          <h2 className="text-base font-semibold">Membres</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Créez les membres de la workspace du projet et assignez-leur un rôle
            métier.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <UserPlus aria-hidden="true" />
          Créer un membre
        </Button>
      </div>

      {members.length > 0 ? (
        <div className="grid gap-2">
          {members.map((member) => (
            <button
              key={member.membershipId}
              type="button"
              onClick={() => openMemberDialog(member)}
              className="border-border hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {member.name}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {member.email}
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
          Aucun membre workspace n'est encore enregistré.
        </p>
      )}

      {isOpen ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-dialog-title"
            className="bg-card text-card-foreground border-border w-full max-w-xl rounded-lg border shadow-lg"
          >
            <div className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
              <h3 id="member-dialog-title" className="text-base font-semibold">
                {editingMember ? "Configurer le membre" : "Créer un membre"}
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
                <label htmlFor="member-name" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="member-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="member-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="member-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {!editingMember ? (
                <div className="grid gap-1">
                  <label
                    htmlFor="member-password"
                    className="text-sm font-medium"
                  >
                    Mot de passe initial
                  </label>
                  <Input
                    id="member-password"
                    type="password"
                    required
                    minLength={12}
                    value={initialPassword}
                    onChange={(event) => setInitialPassword(event.target.value)}
                  />
                </div>
              ) : null}

              <div className="grid gap-1">
                <label htmlFor="member-role" className="text-sm font-medium">
                  Rôle métier
                </label>
                <select
                  id="member-role"
                  value={customRoleId}
                  onChange={(event) => setCustomRoleId(event.target.value)}
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
                >
                  <option value="">Aucun rôle</option>
                  {customRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : null}

              <div className="flex flex-wrap justify-between gap-2">
                {editingMember ? (
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
                      : editingMember
                        ? "Enregistrer"
                        : "Créer le membre"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {isConfirmingDelete && editingMember ? (
            <ConfirmDialog
              title="Supprimer ce membre ?"
              description={`Le membre ${editingMember.name} sera retiré du workspace.`}
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
