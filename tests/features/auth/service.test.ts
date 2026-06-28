import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("@/features/auth/repository", () => ({
  findUserById: vi.fn(),
  findUserByEmail: vi.fn(),
  updateUser: vi.fn(),
}));

import {
  getUserById,
  getUserByEmail,
  updateUserProfile,
} from "@/features/auth/service";
import * as repository from "@/features/auth/repository";

const mockUser = {
  id: "user_1",
  name: "Alice",
  email: "alice@example.com",
  emailVerified: false,
  image: null,
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth service", () => {
  describe("getUserById", () => {
    it("returns user when found", async () => {
      vi.mocked(repository.findUserById).mockResolvedValue(mockUser);
      const result = await getUserById("user_1");
      expect(result).toEqual(mockUser);
      expect(repository.findUserById).toHaveBeenCalledWith("user_1");
    });

    it("returns null when user not found", async () => {
      vi.mocked(repository.findUserById).mockResolvedValue(null);
      const result = await getUserById("unknown");
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("returns user when found", async () => {
      vi.mocked(repository.findUserByEmail).mockResolvedValue(mockUser);
      const result = await getUserByEmail("alice@example.com");
      expect(result).toEqual(mockUser);
    });

    it("returns null when not found", async () => {
      vi.mocked(repository.findUserByEmail).mockResolvedValue(null);
      const result = await getUserByEmail("unknown@example.com");
      expect(result).toBeNull();
    });
  });

  describe("updateUserProfile", () => {
    it("updates and returns the user", async () => {
      const updated = { ...mockUser, name: "Bob" };
      vi.mocked(repository.findUserById).mockResolvedValue(mockUser);
      vi.mocked(repository.updateUser).mockResolvedValue(updated);

      const result = await updateUserProfile("user_1", { name: "Bob" });

      expect(result).toEqual(updated);
      expect(repository.updateUser).toHaveBeenCalledWith("user_1", {
        name: "Bob",
      });
    });

    it("throws when user not found", async () => {
      vi.mocked(repository.findUserById).mockResolvedValue(null);
      await expect(
        updateUserProfile("unknown", { name: "Bob" }),
      ).rejects.toThrow("not found");
    });

    it("trims whitespace from name", async () => {
      const updated = { ...mockUser, name: "Bob" };
      vi.mocked(repository.findUserById).mockResolvedValue(mockUser);
      vi.mocked(repository.updateUser).mockResolvedValue(updated);

      await updateUserProfile("user_1", { name: "  Bob  " });

      expect(repository.updateUser).toHaveBeenCalledWith("user_1", {
        name: "Bob",
      });
    });
  });
});
