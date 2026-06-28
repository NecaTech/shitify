import { describe, expect, it } from "vitest";
import {
  canManagePlatformRole,
  isFounder,
  isPlatformRole,
} from "@/lib/auth/roles";

describe("platform role guards", () => {
  it("recognizes the narrow platform role set", () => {
    expect(isPlatformRole("founder")).toBe(true);
    expect(isPlatformRole("user")).toBe(true);
    expect(isPlatformRole("admin")).toBe(false);
    expect(isPlatformRole("owner")).toBe(false);
  });

  it("allows only founders to manage platform roles", () => {
    expect(canManagePlatformRole({ role: "founder" })).toBe(true);
    expect(canManagePlatformRole({ role: "user" })).toBe(false);
    expect(canManagePlatformRole(null)).toBe(false);
  });

  it("does not infer founder authority from identity fields", () => {
    const regularUser = {
      id: "user_founder_like",
      email: "founder@example.test",
      role: "user" as const,
    };

    expect(isFounder(regularUser)).toBe(false);
  });
});
