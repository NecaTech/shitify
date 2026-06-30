"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getVisibleDashboardLinks } from "../config";
import type { DashboardNavLink } from "../types";
import type { DashboardViewMode, DashboardViewOption } from "../view-mode";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  layout,
}: {
  item: DashboardNavLink;
  active: boolean;
  layout: "desktop" | "mobile";
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "transition-colors",
        layout === "desktop"
          ? "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium"
          : "flex min-w-20 flex-col items-center justify-center gap-1 px-2 py-1 text-xs font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>{item.label}</span>
    </Link>
  );
}

export function DashboardSidebar({
  viewMode,
  viewOptions,
}: {
  viewMode: DashboardViewMode;
  viewOptions: DashboardViewOption[];
}) {
  const pathname = usePathname();
  const links = getVisibleDashboardLinks(viewMode, viewOptions);

  return (
    <aside className="border-border bg-card fixed inset-y-0 left-0 hidden w-64 border-r lg:flex lg:flex-col">
      <div className="border-border border-b px-5 py-4">
        <p className="text-sm font-semibold">Espace privé</p>
        <p className="text-muted-foreground mt-1 text-xs">Dashboard</p>
      </div>
      <nav
        aria-label="Navigation dashboard"
        className="flex flex-1 flex-col gap-1 p-3"
      >
        {links.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            layout="desktop"
          />
        ))}
      </nav>
    </aside>
  );
}

export function DashboardBottomNav({
  viewMode,
  viewOptions,
}: {
  viewMode: DashboardViewMode;
  viewOptions: DashboardViewOption[];
}) {
  const pathname = usePathname();
  const links = getVisibleDashboardLinks(viewMode, viewOptions);

  return (
    <nav
      aria-label="Navigation dashboard mobile"
      className="border-border bg-card fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t px-2 lg:hidden"
    >
      {links.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isActivePath(pathname, item.href)}
          layout="mobile"
        />
      ))}
    </nav>
  );
}
