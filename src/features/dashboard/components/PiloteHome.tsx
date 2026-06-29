import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FlaskConical,
  Layers,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  workspaceRoleAtLeast,
  workspaceRoleDefinitions,
} from "@/features/workspace/roles";
import type { WorkspaceRole } from "@/features/workspace/roles";
import type { DashboardViewMode } from "../view-mode";

type PiloteHomeProps = {
  viewMode: DashboardViewMode;
  appEnv: "dev" | "staging" | "prod";
  localAuthEnabled: boolean;
  hasDatabaseUrl: boolean;
};

function phaseLabel(appEnv: PiloteHomeProps["appEnv"]) {
  if (appEnv === "prod") return "Production";
  return appEnv;
}

function FounderPilot({
  appEnv,
  localAuthEnabled,
  hasDatabaseUrl,
}: Omit<PiloteHomeProps, "viewMode">) {
  const checklist = [
    {
      label: "Dashboard protégé accessible",
      done: true,
    },
    {
      label: "Auth locale founder disponible en phase dev",
      done: localAuthEnabled,
    },
    {
      label: "DB Neon configurée pour staging",
      done: hasDatabaseUrl && appEnv === "staging",
    },
    {
      label: "Création réelle des admins réservée à staging",
      done: true,
    },
    {
      label: "Production sans auth locale",
      done: appEnv === "prod" && !localAuthEnabled,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="border-border bg-card text-card-foreground rounded-lg border p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-muted-foreground text-sm font-medium">
              Pilote founder
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Vue d'ensemble du socle
            </h1>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Suivez l'état post-clonage du boilerplate, les invariants prêts,
              et les étapes restantes avant une base client exploitable.
            </p>
          </div>
          <div className="border-border bg-background grid w-full gap-2 rounded-lg border p-3 text-sm sm:grid-cols-3 lg:w-auto lg:min-w-96">
            <div>
              <p className="text-muted-foreground text-xs">Phase</p>
              <p className="mt-1 font-medium">{phaseLabel(appEnv)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Auth</p>
              <p className="mt-1 font-medium">
                {localAuthEnabled ? "locale" : "Better Auth"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">DB</p>
              <p className="mt-1 font-medium">
                {hasDatabaseUrl ? "Neon configurée" : "non requise"}
              </p>
            </div>
          </div>
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

      <section className="border-border rounded-lg border p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
            <FlaskConical aria-hidden="true" className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Checklist boilerplate</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Ces invariants réduisent la friction après clonage et guident la
              transition vers staging.
            </p>
          </div>
        </div>
        <div className="grid gap-2">
          {checklist.map((item) => (
            <div
              key={item.label}
              className="border-border flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
            >
              <CheckCircle2
                aria-hidden="true"
                className={
                  item.done
                    ? "text-foreground size-4"
                    : "text-muted-foreground size-4"
                }
              />
              <span className={item.done ? "" : "text-muted-foreground"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WorkspacePilot({ role }: { role: WorkspaceRole }) {
  const roleDefinition = workspaceRoleDefinitions[role];
  const canOpenAdministration = workspaceRoleAtLeast(role, "admin");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="border-border bg-card text-card-foreground rounded-lg border p-5 sm:p-6">
        <div className="bg-muted inline-flex size-10 items-center justify-center rounded-lg">
          <BriefcaseBusiness aria-hidden="true" className="size-5" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Vue {roleDefinition.label}
        </h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-6">
          {roleDefinition.description} Le founder conserve son identité et
          bascule seulement de perspective pour vérifier les droits et les vues.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="border-border rounded-lg border p-5">
          <div className="bg-muted inline-flex size-9 items-center justify-center rounded-lg">
            <Layers aria-hidden="true" className="size-4" />
          </div>
          <h2 className="mt-4 text-base font-semibold">
            Fonctionnalités disponibles
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Cette perspective affiche uniquement les sections accessibles au
            rôle workspace sélectionné.
          </p>
        </article>

        <article className="border-border rounded-lg border p-5">
          <div className="bg-muted inline-flex size-9 items-center justify-center rounded-lg">
            <Settings2 aria-hidden="true" className="size-4" />
          </div>
          <h2 className="mt-4 text-base font-semibold">Membres et droits</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {canOpenAdministration
              ? "Ce rôle peut accéder aux vues d'administration workspace."
              : "Ce rôle ne voit pas l'administration dans sa navigation."}
          </p>
          {canOpenAdministration ? (
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/administration">
                Ouvrir
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </article>
      </section>
    </div>
  );
}

export function PiloteHome(props: PiloteHomeProps) {
  if (props.viewMode !== "founder") {
    return <WorkspacePilot role={props.viewMode} />;
  }

  return (
    <FounderPilot
      appEnv={props.appEnv}
      localAuthEnabled={props.localAuthEnabled}
      hasDatabaseUrl={props.hasDatabaseUrl}
    />
  );
}
