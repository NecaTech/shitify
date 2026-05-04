import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardConfig } from "../types";

type DashboardHomeProps = {
  config: DashboardConfig;
  userEmail: string;
  profileSlot: React.ReactNode;
};

export function DashboardHome({
  config,
  userEmail,
  profileSlot,
}: DashboardHomeProps) {
  return (
    <main className="bg-background flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-border flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-muted-foreground text-sm font-medium">
              {config.eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {config.title}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              {config.description}
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              Connecté en tant que{" "}
              <span className="text-foreground font-medium">{userEmail}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {config.actions.map((action) => (
              <Button
                key={action.label}
                asChild
                variant={action.tone === "primary" ? "default" : "outline"}
              >
                <Link href={action.href}>
                  {action.tone === "primary" ? (
                    <ArrowRight aria-hidden="true" />
                  ) : (
                    <Settings aria-hidden="true" />
                  )}
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </header>

        <section
          aria-label="Indicateurs"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {config.stats.map((stat) => (
            <article
              key={stat.label}
              className="border-border bg-card text-card-foreground rounded-lg border p-4"
            >
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-5">
                {stat.helper}
              </p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="grid gap-4 md:grid-cols-2">
            {config.sections.map((section) => (
              <article
                key={section.title}
                className="border-border rounded-lg border p-4"
              >
                <h2 className="text-base font-semibold">{section.title}</h2>
                <p className="text-muted-foreground mt-1 text-sm leading-5">
                  {section.description}
                </p>
                <dl className="mt-4 divide-y">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 py-2 text-sm"
                    >
                      <dt className="text-muted-foreground">{item.label}</dt>
                      <dd className="text-right font-medium">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </section>

          <aside className="border-border rounded-lg border p-4">
            <h2 className="text-base font-semibold">Profil</h2>
            <div className="mt-4">{profileSlot}</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
