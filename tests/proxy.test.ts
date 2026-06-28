import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import { config, proxy } from "@/proxy";
import { LOCAL_AUTH_COOKIE_NAME } from "@/lib/auth/local-cookie";

// Extract route segments from proxy matcher (strips /:path* wildcards)
const matcherRoutes = config.matcher.map((m) => m.replace(/\/:path\*$/, ""));

function getAuthenticatedRoutes(dir: string): string[] {
  const base = join(process.cwd(), dir);
  return readdirSync(base)
    .filter((entry) => statSync(join(base, entry)).isDirectory())
    .map((entry) => `/${entry}`);
}

describe("proxy route cohérence", () => {
  it("chaque route sous app/(authenticated)/ est dans config.matcher", () => {
    const routes = getAuthenticatedRoutes("src/app/(authenticated)");
    for (const route of routes) {
      expect(
        matcherRoutes,
        `Route "${route}" présente dans app/(authenticated)/ mais absente du config.matcher dans proxy.ts`,
      ).toContain(route);
    }
  });

  it("propage le pathname courant aux Server Components", () => {
    const request = new NextRequest("https://example.com/login");
    const response = proxy(request);

    expect(response.headers.get("x-middleware-request-x-current-path")).toBe(
      "/login",
    );
  });

  it("accepte le cookie de session locale pour le dashboard boilerplate", () => {
    const request = new NextRequest("https://example.com/dashboard", {
      headers: { cookie: `${LOCAL_AUTH_COOKIE_NAME}=signed-local-token` },
    });
    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-request-x-current-path")).toBe(
      "/dashboard",
    );
  });
});
