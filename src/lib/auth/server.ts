import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  canAttemptDatabaseAuth,
  canAttemptLocalAuth,
  getLocalAuthSession,
} from "./local";

/**
 * Use in Server Components / Server Actions that require an authenticated session.
 * getSessionCookie() in proxy.ts only checks cookie presence, not signature.
 * This performs a full DB-backed validation.
 */
export async function requireSession() {
  const headersList = await headers();
  if (canAttemptLocalAuth()) {
    const localSession = await getLocalAuthSession();
    if (localSession) return localSession;

    if (!canAttemptDatabaseAuth()) {
      const pathname = headersList.get("x-current-path") ?? "/";
      redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }

  const { auth } = await import("./index");
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    const pathname = headersList.get("x-current-path") ?? "/";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }
  return session;
}

/**
 * Like requireSession() but returns null instead of redirecting.
 * Use in public pages that optionally personalize for authenticated users.
 */
export async function getOptionalSession() {
  if (canAttemptLocalAuth()) {
    const localSession = await getLocalAuthSession();
    if (localSession || !canAttemptDatabaseAuth()) return localSession;
  }

  const { auth } = await import("./index");
  return auth.api.getSession({ headers: await headers() });
}
