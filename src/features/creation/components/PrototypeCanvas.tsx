"use client";

// Prototype interactif générique (V1a) — la « démo live » de la création. Un
// gabarit de console SaaS paramétré par le domaine de l'idée : les données
// fictives (profils, télémétrie, métriques) dérivent de l'idée. Voix
// « performance » (EN) : c'est la fausse startup qui parle, pas le chrome FR.

import { useState } from "react";
import type { Creation } from "../types";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type PrototypeCanvasProps = {
  creation: Creation;
};

export function PrototypeCanvas({ creation }: PrototypeCanvasProps) {
  const { idea, name } = creation;
  const domainNoun = capitalize(idea.domainNoun);

  const profiles = [
    `${domainNoun} Standard`,
    `${domainNoun} Pro`,
    `${domainNoun} Ultra`,
  ] as const;

  const [profile, setProfile] = useState<string>(profiles[0]);
  const [enterprise, setEnterprise] = useState(false);
  const [deployed, setDeployed] = useState(false);

  function deploy() {
    setDeployed(true);
  }

  return (
    <div className="border-brand-void-foreground/20 bg-brand-void/80 rounded-2xl border">
      {/* Barre de titre — fenêtre d'application factice */}
      <div className="border-brand-void-foreground/15 flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-black">
          <span className="bg-brand-neon-mint shadow-neon-mint size-2 rounded-full" />
          {name}
        </div>
        <span className="text-brand-neon-yellow text-xs font-black tracking-widest uppercase">
          live demo
        </span>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-brand-void-foreground/60 text-xs font-bold uppercase">
            {domainNoun} profile
            <select
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
              className="border-brand-void-foreground/20 bg-brand-void-foreground/5 text-brand-void-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              {profiles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-brand-void-foreground/60 text-xs font-bold uppercase">
            Coverage
            <select
              defaultValue="Planetary"
              className="border-brand-void-foreground/20 bg-brand-void-foreground/5 text-brand-void-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              {["Planetary", "Intergalactic", "Everywhere at once"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="text-brand-void-foreground flex items-end gap-2 pb-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={enterprise}
              onChange={(event) => setEnterprise(event.target.checked)}
              className="accent-brand-neon-pink size-4"
            />
            Enterprise mode
          </label>

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={deploy}
              className="from-brand-neon-pink to-brand-neon-yellow text-brand-void shadow-neon-pink rounded-full bg-linear-to-r px-7 py-3 text-sm font-black transition hover:brightness-110"
            >
              Deploy ⚡
            </button>
          </div>
        </div>

        {deployed ? (
          <div
            role="status"
            className="border-brand-neon-mint bg-brand-neon-mint/10 mt-6 rounded-2xl border p-5"
          >
            <h3 className="text-brand-neon-mint text-sm font-black uppercase">
              Deployment confirmed — {profile}
              {enterprise ? " (enterprise)" : ""}
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                [`Active ${idea.domain}`, "0"],
                [idea.derivedMetricLabel, idea.derivedMetricValue],
                ["Revenue", "€0"],
                ["Users", "0"],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-brand-void-foreground/60 text-xs font-bold uppercase">
                    {term}
                  </dt>
                  <dd className="text-brand-void-foreground mt-1 text-lg font-black">
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-brand-void-foreground/50 mt-4 text-xs font-bold">
              {domainNoun} onboarded: 0 · Revenue: €0 · {idea.promiseNoun}{" "}
              delivered: 0
            </p>
          </div>
        ) : (
          <p className="text-brand-void-foreground/50 mt-6 text-center text-sm font-semibold">
            Configure your {domainNoun.toLowerCase()} profile and deploy the
            {idea.promiseNoun} layer.
          </p>
        )}
      </div>
    </div>
  );
}
