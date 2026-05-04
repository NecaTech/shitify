import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/server";
import { getUserById } from "@/features/auth/service";
import { ProfileForm } from "@/features/auth/components/ProfileForm";
import { DashboardHome } from "@/features/dashboard/components/DashboardHome";
import { dashboardConfig } from "@/features/dashboard/config";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();

  // Démontre le flow page → service → repository → DB avec cache 'user:id'
  const user = await getUserById(session.user.id);

  return (
    <DashboardHome
      config={dashboardConfig}
      userEmail={session.user.email}
      profileSlot={<ProfileForm initialName={user?.name ?? ""} />}
    />
  );
}
