import { ShieldCheck } from "lucide-react";

export function AdministrationPlaceholder() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="border-border bg-card text-card-foreground rounded-lg border p-5 sm:p-6">
        <div className="bg-muted inline-flex size-10 items-center justify-center rounded-lg">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Administration
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
          Aucun membre n'est affiché pour le moment. Les accès du projet seront
          gérés depuis cet espace lorsqu'ils seront disponibles.
        </p>
      </section>
    </div>
  );
}
