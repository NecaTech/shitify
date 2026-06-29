"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isFounder, isPlatformRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import {
  DASHBOARD_VIEW_COOKIE,
  isDashboardViewMode,
  type DashboardViewMode,
} from "./view-mode";
import type { ActionResult } from "@/types/result";

export async function setDashboardViewModeAction(
  mode: DashboardViewMode,
): Promise<ActionResult<DashboardViewMode>> {
  if (!isDashboardViewMode(mode)) {
    return { success: false, error: "Vue dashboard invalide" };
  }

  const session = await requireSession();
  const platformUser = isPlatformRole(session.user.role)
    ? { role: session.user.role }
    : null;

  if (!isFounder(platformUser)) {
    return { success: false, error: "Vue réservée au founder" };
  }

  const cookieStore = await cookies();
  cookieStore.set(DASHBOARD_VIEW_COOKIE, mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/dashboard");

  return { success: true, data: mode };
}
