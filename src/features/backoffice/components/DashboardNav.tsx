"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getVisibleDashboardNavigation } from "../config";
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
  const navigation = getVisibleDashboardNavigation(viewMode, viewOptions);

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
        {navigation.map((item) => {
          if (item.type === "link") {
            return (
              <NavLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
                layout="desktop"
              />
            );
          }

          const Icon = item.icon;
          return (
            <div key={item.label} className="pt-3">
              <div className="text-muted-foreground flex items-center gap-2 px-3 pb-2 text-xs font-semibold tracking-wide uppercase">
                <Icon aria-hidden="true" className="size-4" />
                <span>{item.label}</span>
              </div>
              <div className="flex flex-col gap-1">
                {item.items.map((child) => (
                  <NavLink
                    key={child.href}
                    item={child}
                    active={isActivePath(pathname, child.href)}
                    layout="desktop"
                  />
                ))}
              </div>
            </div>
          );
        })}
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
  const navigation = getVisibleDashboardNavigation(viewMode, viewOptions);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const selectedGroup = navigation.find(
    (item) => item.type === "group" && item.label === openGroup,
  );

  return (
    <>
      {selectedGroup?.type === "group" ? (
        <div className="fixed right-0 bottom-16 left-0 z-40 lg:hidden">
          <div
            role="dialog"
            aria-label={`${selectedGroup.label} mobile`}
            className="border-border bg-card/98 mx-3 mb-3 rounded-2xl border p-3 shadow-2xl backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p className="text-sm font-semibold">{selectedGroup.label}</p>
              <button
                type="button"
                onClick={() => setOpenGroup(null)}
                className="text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-full"
                aria-label="Fermer le sous-menu"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="grid gap-2">
              {selectedGroup.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenGroup(null)}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors",
                    isActivePath(pathname, item.href)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:text-primary",
                  )}
                >
                  <item.icon aria-hidden="true" className="size-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Navigation dashboard mobile"
        className="border-border bg-card fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t px-2 lg:hidden"
      >
        {navigation.map((item) => {
          if (item.type === "link") {
            return (
              <NavLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
                layout="mobile"
              />
            );
          }

          const active =
            openGroup === item.label ||
            item.items.some((child) => isActivePath(pathname, child.href));
          const ExpandedIcon =
            openGroup === item.label ? ChevronUp : ChevronDown;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setOpenGroup((current) =>
                  current === item.label ? null : item.label,
                )
              }
              aria-expanded={openGroup === item.label}
              className={cn(
                "flex min-w-20 flex-col items-center justify-center gap-1 px-2 py-1 text-xs font-medium",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative">
                <item.icon aria-hidden="true" className="size-4" />
                <ExpandedIcon
                  aria-hidden="true"
                  className="bg-card absolute -right-2 -bottom-1 size-3 rounded-full"
                />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
