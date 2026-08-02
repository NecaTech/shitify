import { Crown } from "lucide-react";
import type { DashboardViewMode, DashboardViewOption } from "../view-mode";
import { DashboardViewSwitch } from "./DashboardViewSwitch";
import { DashboardLogoutButton } from "./DashboardLogoutButton";

type DashboardHeaderProps = {
  title: string;
  userName: string | null | undefined;
  isFounder: boolean;
  viewMode: DashboardViewMode;
  viewOptions: DashboardViewOption[];
  localAuthEnabled?: boolean;
};

export function DashboardHeader({
  title,
  userName,
  isFounder,
  viewMode,
  viewOptions,
  localAuthEnabled = false,
}: DashboardHeaderProps) {
  return (
    <header className="border-border bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
      <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          {userName ? (
            <p className="text-muted-foreground truncate text-xs">{userName}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isFounder ? (
            <>
              <DashboardViewSwitch
                currentView={viewMode}
                viewOptions={viewOptions}
              />
              <span className="border-border bg-muted hidden h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium sm:inline-flex">
                <Crown aria-hidden="true" className="size-3.5" />
                Founder
              </span>
            </>
          ) : null}
          <DashboardLogoutButton localAuthEnabled={localAuthEnabled} />
        </div>
      </div>
    </header>
  );
}
