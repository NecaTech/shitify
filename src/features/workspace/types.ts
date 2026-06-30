export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
};

export type WorkspaceCustomRoleSummary = {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  permissions: {
    navigation: ("dashboard" | "administration")[];
  };
};

export type WorkspaceMemberRoleSummary = {
  membershipId: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  bootstrapRole: "owner" | "admin" | "member";
  customRoleId: string | null;
};
