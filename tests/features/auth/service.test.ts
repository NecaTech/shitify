import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the repository so service tests never hit the DB
vi.mock("@/features/auth/repository", () => ({
  findUserById: vi.fn(),
  findUserByEmail: vi.fn(),
}));

// Mock server-only so it doesn't throw in test env
vi.mock("server-only", () => ({}));

import { getUserById, getUserByEmail } from "@/features/auth/service";
import * as repository from "@/features/auth/repository";

const mockUser = {
  id: "user_1",
  name: "Alice",
  email: "alice@example.com",
  emailVerified: false,
  image: null,
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
});
