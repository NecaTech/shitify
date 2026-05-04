import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/server";
import { CrudWorkbench } from "@/features/crud/components/CrudWorkbench";
import {
  getResources,
  getResourceWithFields,
  getResourceRecords,
} from "@/features/crud/service";

export const metadata: Metadata = { title: "CRUD" };

type CrudPageProps = {
  searchParams: Promise<{ entity?: string }>;
};

export default async function CrudPage({ searchParams }: CrudPageProps) {
  await requireSession();
  const params = await searchParams;
  const entities = await getResources();
  const selectedId = params.entity ?? entities[0]?.id;
  const selectedEntity = selectedId
    ? await getResourceWithFields(selectedId)
    : null;
  const records = selectedEntity
    ? await getResourceRecords(selectedEntity.id)
    : [];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          CRUD configurable
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Crée, modifie et supprime des ressources métier sans nouvelle
          migration.
        </p>
      </div>

      <CrudWorkbench
        entities={entities}
        selectedEntity={selectedEntity}
        records={records}
      />
    </main>
  );
}
