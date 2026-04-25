import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connecté en tant que{" "}
          <span className="text-foreground font-medium">
            {session.user.email}
          </span>
        </p>
      </div>
    </main>
  );
}
