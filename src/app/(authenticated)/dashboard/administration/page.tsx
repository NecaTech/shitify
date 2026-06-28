import type { Metadata } from "next";
import { AdministrationPlaceholder } from "@/features/dashboard/components/AdministrationPlaceholder";

export const metadata: Metadata = { title: "Administration" };

export default async function AdministrationPage() {
  return <AdministrationPlaceholder />;
}
