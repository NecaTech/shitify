"use client";

import { useState, useTransition } from "react";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assignWorkspaceMemberCustomRoleAction } from "@/features/workspace/actions";
import type {
  WorkspaceCustomRoleSummary,
  WorkspaceMemberRoleSummary,
} from "@/features/workspace/types";

type AssignRoleFormProps = {
  members: WorkspaceMemberRoleSummary[];
  customRoles: WorkspaceCustomRoleSummary[];
};

export function AssignRoleForm({ members, customRoles }: AssignRoleFormProps) {
  const [membershipId, setMembershipId] = useState(
    members[0]?.membershipId ?? "",
  );
  const [roleId, setRoleId] = useState(customRoles[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await assignWorkspaceMemberCustomRoleAction({
        membershipId,
        roleId,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage("Rôle assigné au membre sélectionné.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="assign-role-member" className="text-sm font-medium">
          Membre
        </label>
        <select
          id="assign-role-member"
          required
          value={membershipId}
          onChange={(event) => setMembershipId(event.target.value)}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
        >
          {members.map((member) => (
            <option key={member.membershipId} value={member.membershipId}>
              {member.name} - {member.email}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="assign-role-role" className="text-sm font-medium">
          Rôle
        </label>
        <select
          id="assign-role-role"
          required
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
        >
          {customRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="text-destructive text-sm md:col-span-2">{error}</p>
      ) : null}
      {message ? (
        <p className="text-sm font-medium md:col-span-2">{message}</p>
      ) : null}
      <div className="md:col-span-2">
        <Button
          type="submit"
          disabled={
            isPending || members.length === 0 || customRoles.length === 0
          }
        >
          <UserCog aria-hidden="true" />
          {isPending ? "Assignation..." : "Assigner le rôle"}
        </Button>
      </div>
    </form>
  );
}
