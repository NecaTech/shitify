export function shouldLoadFounderWorkspaceRoles({
  appEnv,
  hasDatabaseUrl,
  isFounder,
}: {
  appEnv: "dev" | "staging" | "prod";
  hasDatabaseUrl: boolean;
  isFounder: boolean;
}) {
  return isFounder && appEnv !== "prod" && hasDatabaseUrl;
}

export async function loadFounderWorkspaceRolesSafely() {
  try {
    const { getAdministrationWorkspaceOptions, getWorkspaceCustomRoleOptions } =
      await import("@/features/workspace/service");
    const [workspace] = await getAdministrationWorkspaceOptions({
      actorRole: "founder",
      actorUserId: "founder",
    });
    if (!workspace) return [];
    return getWorkspaceCustomRoleOptions(workspace.id);
  } catch {
    return [];
  }
}

export async function loadAdministrationWorkspaceDataSafely({
  enabled,
  actorRole,
  actorUserId,
}: {
  enabled: boolean;
  actorRole: "founder" | "user";
  actorUserId: string;
}) {
  if (!enabled) return { workspaces: [], customRoles: [], members: [] };

  try {
    const {
      getAdministrationWorkspaceOptions,
      getWorkspaceCustomRoleOptions,
      getWorkspaceMemberRoleOptions,
    } = await import("@/features/workspace/service");
    const workspaces = await getAdministrationWorkspaceOptions({
      actorRole,
      actorUserId,
    });
    const [customRoles, members] = workspaces[0]
      ? await Promise.all([
          getWorkspaceCustomRoleOptions(workspaces[0].id),
          getWorkspaceMemberRoleOptions(workspaces[0].id),
        ])
      : [[], []];
    return { workspaces, customRoles, members };
  } catch {
    return { workspaces: [], customRoles: [], members: [] };
  }
}
