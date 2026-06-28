import type { Metadata } from "next";
import { PiloteHome } from "@/features/dashboard/components/PiloteHome";

export const metadata: Metadata = { title: "Pilote" };

export default async function DashboardPage() {
  return <PiloteHome />;
}
