import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/server";
import { getUserById } from "@/features/auth/service";
import { ProfileForm } from "@/features/auth/components/ProfileForm";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();

  // Démontre le flow page → service → repository → DB avec cache 'user:id'
  const user = await getUserById(session.user.id);

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connecté en tant que{" "}
          <span className="text-foreground font-medium">
            {session.user.email}
          </span>
        </p>
      </div>

      <section className="border-border rounded-xl border p-6">
        <h2 className="mb-4 text-base font-semibold">Mon profil</h2>
        <ProfileForm initialName={user?.name ?? ""} />
      </section>
    </main>
  );
}
