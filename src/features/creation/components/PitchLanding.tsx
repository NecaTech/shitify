// Voix « performance » (EN) — le théâtre startup sensationnaliste : la landing
// parodique qui encadre le prototype comme « démo live ». Contraste porté par la
// forme visuelle (parodie assumée) ; la copie reste au premier degré.

import type { ReactNode } from "react";
import type { Creation } from "../types";

// Classes complètes et statiques pour que Tailwind les détecte (pas de nom de
// classe construit dynamiquement). L'index défile sur les teintes néon.
const CARD_STYLES = [
  "border-brand-neon-pink bg-brand-neon-pink/10",
  "border-brand-neon-mint bg-brand-neon-mint/10",
  "border-brand-neon-yellow bg-brand-neon-yellow/10",
  "border-brand-neon-blue bg-brand-neon-blue/10",
  "border-brand-neon-orange bg-brand-neon-orange/10",
] as const;

const VALUE_STYLES = [
  "text-brand-neon-pink",
  "text-brand-neon-mint",
  "text-brand-neon-yellow",
  "text-brand-neon-blue",
  "text-brand-neon-orange",
] as const;

type PitchLandingProps = {
  creation: Creation;
  /** Le prototype interactif enchâssé dans le cadre « live demo ». */
  demo?: ReactNode;
};

export function PitchLanding({ creation, demo }: PitchLandingProps) {
  const { name, pitch, prototype } = creation;

  return (
    <div className="bg-brand-void text-brand-void-foreground">
      {/* Hero — nom + tagline + claim */}
      <section className="mx-auto max-w-6xl px-6 pt-16 text-center">
        <p className="text-brand-neon-mint text-sm font-black tracking-widest uppercase">
          🚀 {name} · {pitch.kicker} 🚀
        </p>
        <h1 className="mx-auto mt-4 max-w-5xl text-5xl leading-none font-black tracking-tight md:text-7xl">
          {pitch.tagline}
        </h1>
        <p className="text-brand-void-foreground/80 mx-auto mt-6 max-w-2xl text-xl font-semibold">
          {pitch.claim}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="from-brand-neon-mint to-brand-neon-blue text-brand-void shadow-neon-mint rounded-full bg-linear-to-r px-7 py-3.5 text-sm font-black transition hover:brightness-110"
          >
            ⚡ {pitch.ctaPrimary}
          </button>
          <button
            type="button"
            className="border-brand-neon-yellow text-brand-neon-yellow shadow-neon-yellow hover:bg-brand-neon-yellow/10 rounded-full border-2 px-7 py-3.5 text-sm font-black transition"
          >
            👀 {pitch.ctaSecondary}
          </button>
        </div>
      </section>

      {/* Métriques vanity */}
      <section aria-label="Metrics" className="mx-auto max-w-6xl px-6 pt-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {pitch.metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`rounded-2xl border-2 p-5 text-center ${CARD_STYLES[index % CARD_STYLES.length]}`}
            >
              <div className="text-brand-void-foreground/60 text-xs font-bold uppercase">
                {metric.label}
              </div>
              <div
                className={`mt-2 text-lg font-black ${VALUE_STYLES[index % VALUE_STYLES.length]}`}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prototype interactif enchâssé — « live demo » */}
      <section aria-label="Live demo" className="mx-auto max-w-5xl px-6 pt-16">
        <div className="border-brand-neon-pink bg-brand-void/60 rounded-3xl border-2 p-8">
          <p className="text-brand-neon-mint text-center text-xl font-black">
            {prototype.title} — {prototype.caption}
          </p>
          <div className="mt-8">{demo}</div>
        </div>
      </section>

      {/* Sections variables dérivées de l'idée */}
      <section
        aria-label="Pitch sections"
        className="mx-auto max-w-6xl px-6 py-24"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {pitch.sections.map((section, index) => (
            <div
              key={section.title}
              className="border-brand-void-foreground/20 bg-brand-void-foreground/5 rounded-2xl border-2 p-7"
            >
              <h2
                className={`text-xl font-black ${VALUE_STYLES[index % VALUE_STYLES.length]}`}
              >
                {section.title}
              </h2>
              <p className="text-brand-void-foreground/70 mt-2 text-sm leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <p className="text-brand-neon-mint text-sm font-black">
          {pitch.footer} 🎉
        </p>
      </footer>
    </div>
  );
}
