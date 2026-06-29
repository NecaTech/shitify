"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorkspaceAdminAction } from "@/features/workspace/actions";
import type { WorkspaceSummary } from "@/features/workspace/types";

type CreateAdminFormProps = {
  workspaces: WorkspaceSummary[];
};

export function CreateAdminForm({ workspaces }: CreateAdminFormProps) {
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await createWorkspaceAdminAction({
        workspaceId,
        name,
        email,
        initialPassword,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage("Admin créé avec le rôle workspace admin.");
      setName("");
      setEmail("");
      setInitialPassword("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1 md:col-span-2">
        <label htmlFor="admin-workspace" className="text-sm font-medium">
          Workspace
        </label>
        <select
          id="admin-workspace"
          required
          value={workspaceId}
          onChange={(event) => setWorkspaceId(event.target.value)}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 py-1 text-sm outline-none focus-visible:ring-3"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
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
      <div className="flex flex-col gap-1">
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
      <div className="flex flex-col gap-1 md:col-span-2">
        <label htmlFor="admin-password" className="text-sm font-medium">
          Mot de passe initial{" "}
          <span className="text-muted-foreground">(12 caractères min.)</span>
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
      {error ? (
        <p className="text-destructive text-sm md:col-span-2">{error}</p>
      ) : null}
      {message ? (
        <p className="text-sm font-medium md:col-span-2">{message}</p>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending || workspaces.length === 0}>
          <UserPlus aria-hidden="true" />
          {isPending ? "Création..." : "Créer un admin"}
        </Button>
      </div>
    </form>
  );
}
