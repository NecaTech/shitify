import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./index";

/**
 * Use in Server Components / Server Actions that require an authenticated session.
 * getSessionCookie() in proxy.ts only checks cookie presence, not signature.
 * This performs a full DB-backed validation.
 */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

/**
 * Like requireSession() but returns null instead of redirecting.
 * Use in public pages that optionally personalize for authenticated users.
 */
export async function getOptionalSession() {
  return auth.api.getSession({ headers: await headers() });
}
