"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { localLogoutAction } from "@/features/auth/actions";

type DashboardLogoutButtonProps = {
  localAuthEnabled?: boolean;
};

export function DashboardLogoutButton({
  localAuthEnabled = false,
}: DashboardLogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      if (localAuthEnabled) {
        await localLogoutAction();
      } else {
        await authClient.signOut();
      }
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      aria-label="Se déconnecter"
    >
      <LogOut aria-hidden="true" />
      <span className="hidden sm:inline">Déconnexion</span>
    </Button>
  );
}
