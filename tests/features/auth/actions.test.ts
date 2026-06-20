import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/lib/auth/server", () => ({ requireSession: vi.fn() }));
vi.mock("@/features/auth/service", () => ({ updateUserProfile: vi.fn() }));

import { revalidateTag } from "next/cache";
import { updateProfileAction } from "@/features/auth/actions";
import { requireSession } from "@/lib/auth/server";
import { updateUserProfile } from "@/features/auth/service";

const user = {
  id: "user_example",
  name: "Ada Example",
  email: "ada@example.test",
  emailVerified: false,
  image: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const session = {
  id: "session_example",
  userId: user.id,
  token: "session_token_example",
  expiresAt: new Date("2026-01-02T00:00:00.000Z"),
  ipAddress: null,
  userAgent: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth profile action contract", () => {
  it("returns a validation error before reading the session", async () => {
    const result = await updateProfileAction({ name: "" });

    expect(result).toMatchObject({
      success: false,
      error: "Le nom ne peut pas être vide",
    });
    expect(requireSession).not.toHaveBeenCalled();
    expect(updateUserProfile).not.toHaveBeenCalled();
  });

  it("updates the authenticated user and revalidates the user cache tag", async () => {
    vi.mocked(requireSession).mockResolvedValue({ session, user });
    vi.mocked(updateUserProfile).mockResolvedValue({
      ...user,
      name: "Ada Lovelace",
    });

    const result = await updateProfileAction({ name: "Ada Lovelace" });

    expect(result).toMatchObject({
      success: true,
      data: expect.objectContaining({ name: "Ada Lovelace" }),
    });
    expect(updateUserProfile).toHaveBeenCalledWith(user.id, {
      name: "Ada Lovelace",
    });
    expect(revalidateTag).toHaveBeenCalledWith(`user:${user.id}`, "max");
  });

  it("returns an action error instead of leaking service failures", async () => {
    vi.mocked(requireSession).mockResolvedValue({ session, user });
    vi.mocked(updateUserProfile).mockRejectedValue(new Error("database down"));

    const result = await updateProfileAction({ name: "Ada Lovelace" });

    expect(result).toEqual({ success: false, error: "Erreur interne" });
  });
});
