"use client";

import { useOptimistic, useTransition } from "react";
import { BriefcaseBusiness, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { setDashboardViewModeAction } from "../actions";
import type { DashboardViewMode, DashboardViewOption } from "../view-mode";

type DashboardViewSwitchProps = {
  currentView: DashboardViewMode;
  viewOptions: DashboardViewOption[];
};

export function DashboardViewSwitch({
  currentView,
  viewOptions,
}: DashboardViewSwitchProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticView, setOptimisticView] = useOptimistic(currentView);

  function switchView(mode: DashboardViewMode) {
    if (mode === optimisticView) return;

    startTransition(async () => {
      setOptimisticView(mode);
      await setDashboardViewModeAction(mode);
    });
  }

  return (
    <div className="border-border bg-background flex max-w-[calc(100vw-7rem)] gap-0.5 overflow-x-auto rounded-lg border p-0.5">
      {viewOptions.map((option) => {
        const Icon = modeIcon(option.mode);

        return (
          <button
            key={option.mode}
            type="button"
            aria-pressed={optimisticView === option.mode}
            disabled={isPending}
            onClick={() => switchView(option.mode)}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors disabled:opacity-60",
              optimisticView === option.mode
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function modeIcon(mode: DashboardViewMode) {
  if (mode === "founder") return Crown;
  if (mode === "admin") return BriefcaseBusiness;
  return Shield;
}
