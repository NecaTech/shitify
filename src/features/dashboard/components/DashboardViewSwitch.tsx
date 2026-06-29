"use client";

import { useOptimistic, useTransition } from "react";
import {
  BriefcaseBusiness,
  Crown,
  Eye,
  PenLine,
  Shield,
  UserCog,
  Users,
} from "lucide-react";
import {
  workspaceRoleDefinitions,
  workspaceRoles,
} from "@/features/workspace/roles";
import { cn } from "@/lib/utils";
import { setDashboardViewModeAction } from "../actions";
import type { DashboardViewMode } from "../view-mode";

type DashboardViewSwitchProps = {
  currentView: DashboardViewMode;
};

export function DashboardViewSwitch({ currentView }: DashboardViewSwitchProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticView, setOptimisticView] = useOptimistic(currentView);
  const options: DashboardViewMode[] = ["founder", ...workspaceRoles];

  function switchView(mode: DashboardViewMode) {
    if (mode === optimisticView) return;

    startTransition(async () => {
      setOptimisticView(mode);
      await setDashboardViewModeAction(mode);
    });
  }

  return (
    <div className="border-border bg-background flex max-w-[calc(100vw-7rem)] gap-0.5 overflow-x-auto rounded-lg border p-0.5">
      {options.map((mode) => {
        const Icon = modeIcon(mode);

        return (
          <button
            key={mode}
            type="button"
            aria-pressed={optimisticView === mode}
            disabled={isPending}
            onClick={() => switchView(mode)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors disabled:opacity-60",
              optimisticView === mode
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {modeLabel(mode)}
          </button>
        );
      })}
    </div>
  );
}

function modeLabel(mode: DashboardViewMode) {
  if (mode === "founder") return "Founder";
  return workspaceRoleDefinitions[mode].label;
}

function modeIcon(mode: DashboardViewMode) {
  if (mode === "founder") return Crown;
  if (mode === "admin") return BriefcaseBusiness;
  if (mode === "manager") return UserCog;
  if (mode === "staff") return Users;
  if (mode === "editor") return PenLine;
  if (mode === "viewer") return Eye;
  return Shield;
}
