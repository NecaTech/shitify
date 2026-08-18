"use client";

// PROTOTYPE — throwaway. Démo interactive « transport pour oiseaux », contenu de
// dogfood jetable (issue #12). N'est pas une fonctionnalité expédiée du produit.

import { useState } from "react";

const SPECIES = ["Pigeon", "Seagull", "Hummingbird"] as const;

const HUBS = [
  "Rooftop #12 — Paris",
  "Pier 9 — Brighton",
  "Nest cluster — Lagos",
  "Power line — Brooklyn",
] as const;

type RoutePlan = {
  species: string;
  from: string;
  to: string;
  distance: string;
  altitude: string;
  wingFlapsSaved: string;
  eta: string;
};

export function BirdMobilityDemo() {
  const [species, setSpecies] = useState<string>("Pigeon");
  const [from, setFrom] = useState<string>("Rooftop #12 — Paris");
  const [to, setTo] = useState<string>("Pier 9 — Brighton");
  const [businessClass, setBusinessClass] = useState(false);
  const [plan, setPlan] = useState<RoutePlan | null>(null);

  function planMigration() {
    setPlan({
      species,
      from,
      to,
      distance: "1,420 km",
      altitude: "12,000 ft",
      wingFlapsSaved: businessClass ? "−99.2%" : "−98.2%",
      eta: "6.2 min",
    });
  }

  return (
    <div className="border-brand-void-foreground/20 bg-brand-void/80 rounded-2xl border p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-brand-void-foreground/60 text-xs font-bold uppercase">
          Species
          <select
            value={species}
            onChange={(event) => setSpecies(event.target.value)}
            className="border-brand-void-foreground/20 bg-brand-void-foreground/5 text-brand-void-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            {SPECIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-brand-void-foreground/60 text-xs font-bold uppercase">
          Departure
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="border-brand-void-foreground/20 bg-brand-void-foreground/5 text-brand-void-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            {HUBS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-brand-void-foreground/60 text-xs font-bold uppercase">
          Destination
          <select
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="border-brand-void-foreground/20 bg-brand-void-foreground/5 text-brand-void-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            {HUBS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-brand-void-foreground flex items-end gap-2 pb-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={businessClass}
            onChange={(event) => setBusinessClass(event.target.checked)}
            className="accent-brand-neon-pink size-4"
          />
          Business class (feather included)
        </label>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={planMigration}
          className="from-brand-neon-pink to-brand-neon-yellow text-brand-void shadow-neon-pink rounded-full bg-linear-to-r px-7 py-3 text-sm font-black transition hover:brightness-110"
        >
          Plan migration ⚡
        </button>
      </div>

      {plan ? (
        <div
          role="status"
          className="border-brand-neon-mint bg-brand-neon-mint/10 mt-6 rounded-2xl border p-5"
        >
          <h3 className="text-brand-neon-mint text-sm font-black uppercase">
            Route confirmed — {plan.species}
          </h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            {[
              ["Distance", plan.distance],
              ["Altitude", plan.altitude],
              ["Wing flaps saved", plan.wingFlapsSaved],
              ["ETA", plan.eta],
              ["Fare", "€0"],
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
            {plan.from} → {plan.to} · Flights booked: 0 · Revenue: €0
          </p>
        </div>
      ) : (
        <p className="text-brand-void-foreground/50 mt-6 text-center text-sm font-semibold">
          Select a species and plan your first migration.
        </p>
      )}
    </div>
  );
}
