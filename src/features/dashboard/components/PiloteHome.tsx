import Link from "next/link";
import { ArrowRight, Layers, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PiloteHome() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="border-border bg-card text-card-foreground rounded-lg border p-5 sm:p-6">
        <div className="max-w-3xl">
          <p className="text-muted-foreground text-sm font-medium">Pilote</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Tableau de bord privé
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Retrouvez les sections privées du projet depuis une navigation
            stable. Les espaces disponibles restent visibles sans inventer
            d'activité ou de chiffres.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="border-border rounded-lg border p-5">
          <div className="bg-muted inline-flex size-9 items-center justify-center rounded-lg">
            <Layers aria-hidden="true" className="size-4" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Sections privées</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            La navigation expose uniquement les espaces disponibles pour garder
            le tableau de bord clair dès le premier accès.
          </p>
        </article>

        <article className="border-border rounded-lg border p-5">
          <div className="bg-muted inline-flex size-9 items-center justify-center rounded-lg">
            <Settings2 aria-hidden="true" className="size-4" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Administration</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Consultez l'espace réservé à la gestion des accès et des membres du
            projet.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/administration">
              Ouvrir
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </article>
      </section>
    </div>
  );
}
