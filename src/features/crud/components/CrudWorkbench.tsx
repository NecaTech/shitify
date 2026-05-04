"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createResourceAction,
  createResourceFieldAction,
  createResourceRecordAction,
  deleteResourceAction,
  deleteResourceFieldAction,
  deleteResourceRecordAction,
  updateResourceRecordAction,
} from "@/features/crud/actions";
import type {
  Resource,
  ResourceWithFields,
  ResourceRecord,
} from "@/features/crud/types";

type CrudWorkbenchProps = {
  entities: Resource[];
  selectedEntity: ResourceWithFields | null;
  records: ResourceRecord[];
};

type RecordValues = Record<string, string>;

export function CrudWorkbench({
  entities,
  selectedEntity,
  records,
}: CrudWorkbenchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newRecord, setNewRecord] = useState<RecordValues>({});
  const [editedRecords, setEditedRecords] = useState<
    Record<string, RecordValues>
  >({});

  function refreshAfter(action: () => Promise<unknown>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="border-border rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Ressources</h2>
          <span className="text-muted-foreground text-xs">
            {entities.length}
          </span>
        </div>

        <form
          className="mt-4 grid gap-2"
          action={(formData) => {
            const name = String(formData.get("name") ?? "");
            const description = String(formData.get("description") ?? "");
            refreshAfter(() => createResourceAction({ name, description }));
          }}
        >
          <Input name="name" placeholder="Nom de ressource" required />
          <Input name="description" placeholder="Description courte" />
          <Button type="submit" disabled={isPending}>
            <Plus aria-hidden="true" />
            Ajouter
          </Button>
        </form>

        <nav className="mt-5 grid gap-1">
          {entities.map((entity) => (
            <div key={entity.id} className="flex items-center gap-1">
              <Button
                asChild
                variant={
                  selectedEntity?.id === entity.id ? "secondary" : "ghost"
                }
                className="min-w-0 flex-1 justify-start"
              >
                <Link href={`/dashboard/crud?entity=${entity.id}`}>
                  {entity.name}
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() =>
                  refreshAfter(() => deleteResourceAction({ id: entity.id }))
                }
                aria-label={`Supprimer ${entity.name}`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))}
        </nav>
      </aside>

      <section className="grid gap-6">
        {!selectedEntity ? (
          <div className="border-border rounded-lg border p-6">
            <h2 className="text-base font-semibold">
              Crée une ressource pour commencer
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Exemple: clients, demandes, biens, rendez-vous, prestations.
            </p>
          </div>
        ) : (
          <>
            <div className="border-border rounded-lg border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Ressource active
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {selectedEntity.name}
                  </h1>
                  {selectedEntity.description ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {selectedEntity.description}
                    </p>
                  ) : null}
                </div>
                <span className="border-border text-muted-foreground rounded-md border px-2 py-1 text-xs">
                  {selectedEntity.slug}
                </span>
              </div>

              <form
                className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_auto_auto]"
                action={(formData) => {
                  const label = String(formData.get("label") ?? "");
                  const type = String(formData.get("type") ?? "text");
                  const isRequired = formData.get("isRequired") === "on";
                  refreshAfter(() =>
                    createResourceFieldAction({
                      entityId: selectedEntity.id,
                      label,
                      type,
                      isRequired,
                    }),
                  );
                }}
              >
                <Input name="label" placeholder="Nouveau champ" required />
                <select
                  name="type"
                  className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
                  defaultValue="text"
                >
                  <option value="text">Texte</option>
                  <option value="textarea">Long texte</option>
                  <option value="number">Nombre</option>
                  <option value="boolean">Oui/non</option>
                  <option value="date">Date</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="select">Select</option>
                </select>
                <label className="text-muted-foreground flex items-center gap-2 text-sm">
                  <input name="isRequired" type="checkbox" />
                  Requis
                </label>
                <Button type="submit" disabled={isPending}>
                  <Plus aria-hidden="true" />
                  Champ
                </Button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedEntity.fields.map((field) => (
                  <span
                    key={field.id}
                    className="border-border inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm"
                  >
                    {field.label}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isPending}
                      onClick={() =>
                        refreshAfter(() =>
                          deleteResourceFieldAction({
                            id: field.id,
                            entityId: selectedEntity.id,
                          }),
                        )
                      }
                      aria-label={`Supprimer le champ ${field.label}`}
                    >
                      <Trash2 aria-hidden="true" className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border-border overflow-hidden rounded-lg border">
              <div className="border-border bg-muted/30 border-b p-4">
                <h2 className="text-base font-semibold">Enregistrements</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/30 text-muted-foreground">
                    <tr>
                      {selectedEntity.fields.map((field) => (
                        <th key={field.id} className="px-3 py-2 text-left">
                          {field.label}
                        </th>
                      ))}
                      <th className="w-32 px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      {selectedEntity.fields.map((field) => (
                        <td key={field.id} className="px-3 py-2">
                          <Input
                            value={newRecord[field.key] ?? ""}
                            onChange={(event) =>
                              setNewRecord((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))
                            }
                            placeholder={field.label}
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right">
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            isPending || selectedEntity.fields.length === 0
                          }
                          onClick={() =>
                            refreshAfter(async () => {
                              await createResourceRecordAction({
                                entityId: selectedEntity.id,
                                values: newRecord,
                              });
                              setNewRecord({});
                            })
                          }
                        >
                          <Plus aria-hidden="true" />
                          Créer
                        </Button>
                      </td>
                    </tr>

                    {records.map((record) => {
                      const values =
                        editedRecords[record.id] ??
                        Object.fromEntries(
                          Object.entries(record.data).map(([key, value]) => [
                            key,
                            String(value ?? ""),
                          ]),
                        );

                      return (
                        <tr key={record.id}>
                          {selectedEntity.fields.map((field) => (
                            <td key={field.id} className="px-3 py-2">
                              <Input
                                value={values[field.key] ?? ""}
                                onChange={(event) =>
                                  setEditedRecords((current) => ({
                                    ...current,
                                    [record.id]: {
                                      ...values,
                                      [field.key]: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() =>
                                  refreshAfter(() =>
                                    updateResourceRecordAction({
                                      id: record.id,
                                      entityId: selectedEntity.id,
                                      values,
                                    }),
                                  )
                                }
                                aria-label="Sauvegarder"
                              >
                                <Save aria-hidden="true" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                disabled={isPending}
                                onClick={() =>
                                  refreshAfter(() =>
                                    deleteResourceRecordAction({
                                      id: record.id,
                                      entityId: selectedEntity.id,
                                    }),
                                  )
                                }
                                aria-label="Supprimer"
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
