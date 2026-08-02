import type { Metadata } from "next";
import { DashboardShell } from "@/features/backoffice/components/DashboardShell";
import { requireSession } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s | Back-office" },
  robots: { index: false, follow: false },
};

/**
 * Layout partagé pour toutes les routes protégées.
 * requireSession() redirige vers /login si la session est absente.
 * Les pages enfants peuvent ré-appeler requireSession() pour obtenir
 * l'objet session — Better Auth le met en cache au niveau de la requête.
 */
export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return <DashboardShell>{children}</DashboardShell>;
}
