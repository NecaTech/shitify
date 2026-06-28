import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const canAttemptLocalAuth = vi.fn();
const getLocalAuthSession = vi.fn();
const headersList = new Headers({ "x-current-path": "/dashboard" });
const headers = vi.fn(async () => headersList);
const redirect = vi.fn(() => {
  throw new Error("redirect");
});

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/auth/index", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));
vi.mock("@/lib/auth/local", () => ({
  canAttemptLocalAuth,
  getLocalAuthSession,
}));

const session = {
  session: {
    id: "session_example",
    userId: "user_example",
    token: "session_token_example",
    expiresAt: new Date("2026-01-02T00:00:00.000Z"),
    ipAddress: null,
    userAgent: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  user: {
    id: "user_example",
    name: "Ada Example",
    email: "ada@example.test",
    emailVerified: false,
    image: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  canAttemptLocalAuth.mockReturnValue(false);
  getLocalAuthSession.mockResolvedValue(null);
});

describe("auth server session helpers", () => {
  it("returns a local boilerplate session without reading the DB-backed session", async () => {
    canAttemptLocalAuth.mockReturnValue(true);
    getLocalAuthSession.mockResolvedValue(session);
    const { requireSession } = await import("@/lib/auth/server");

    await expect(requireSession()).resolves.toBe(session);
    expect(getLocalAuthSession).toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns the DB-backed session when authenticated", async () => {
    getSession.mockResolvedValue(session);
    const { requireSession } = await import("@/lib/auth/server");

    await expect(requireSession()).resolves.toBe(session);
    expect(getSession).toHaveBeenCalledWith({ headers: headersList });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects anonymous users to login with the current path", async () => {
    getSession.mockResolvedValue(null);
    const { requireSession } = await import("@/lib/auth/server");

    await expect(requireSession()).rejects.toThrow("redirect");
    expect(redirect).toHaveBeenCalledWith("/login?redirect=%2Fdashboard");
  });

  it("returns null for optional anonymous access without redirecting", async () => {
    getSession.mockResolvedValue(null);
    const { getOptionalSession } = await import("@/lib/auth/server");

    await expect(getOptionalSession()).resolves.toBeNull();
    expect(getSession).toHaveBeenCalledWith({ headers: headersList });
    expect(redirect).not.toHaveBeenCalled();
  });
});
