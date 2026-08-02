/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PiloteHome } from "@/features/dashboard/components/PiloteHome";
import type { DashboardViewOption } from "@/features/backoffice/view-mode";

const viewOptions: DashboardViewOption[] = [
  { mode: "founder", label: "Founder", permissions: null },
  {
    mode: "role:operations",
    label: "Operations",
    permissions: { navigation: ["dashboard"] },
  },
];

afterEach(cleanup);

describe("dashboard pilot surface", () => {
  it("does not announce unavailable administration actions for a dashboard-only role", () => {
    render(
      <PiloteHome
        viewMode="role:operations"
        appEnv="dev"
        localAuthEnabled
        hasDatabaseUrl
        databaseKind="local"
        viewOptions={viewOptions}
        isFounder
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Vue Operations" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Membres et droits")).not.toBeInTheDocument();
    expect(screen.queryByText(/ne voit pas/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /ouvrir/i }),
    ).not.toBeInTheDocument();
  });
});
