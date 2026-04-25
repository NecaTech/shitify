"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "../actions";

interface ProfileFormProps {
  initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfileAction({ name });
      if (result.success) {
        setMessage("Profil mis à jour.");
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nom d&apos;affichage
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-input bg-background rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          disabled={isPending}
          required
        />
      </div>

      {message && <p className="text-muted-foreground text-sm">{message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
