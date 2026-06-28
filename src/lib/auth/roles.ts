export const platformRoles = ["founder", "user"] as const;

export type PlatformRole = (typeof platformRoles)[number];

type PlatformRoleHolder = {
  role: PlatformRole;
};

export function isPlatformRole(value: unknown): value is PlatformRole {
  return value === "founder" || value === "user";
}

export function isFounder(user: PlatformRoleHolder | null | undefined) {
  return user?.role === "founder";
}

export function canManagePlatformRole(
  actor: PlatformRoleHolder | null | undefined,
) {
  return isFounder(actor);
}
