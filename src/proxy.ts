import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/dashboard"] as const;
const authRoutes = ["/login", "/register"] as const;

export function proxy(request: NextRequest) {
  const session = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", pathname);

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    // Only propagate internal paths to prevent open redirect attacks
    if (
      pathname.startsWith("/") &&
      !pathname.startsWith("//") &&
      !pathname.includes("://")
    ) {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Si un paramètre "redirect" est présent, l'utilisateur a été redirigé ici par
  // requireSession() car sa session était invalide. On ne le renvoie pas vers
  // le dashboard pour éviter une boucle de redirection.
  if (isAuthRoute && session && !request.nextUrl.searchParams.has("redirect")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
