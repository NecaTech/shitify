// Générateur de pitch et de métriques vanity — fonction pure.
//
// Le pitch est dérivé de l'idée (domaine + promesse), jamais codé en dur pour
// une création donnée. Deux invariants sont structurels et inconditionnels :
//
// 1. la « vérité à zéro » (Revenue 0 €, Users 0) est toujours présente ;
// 2. au moins une métrique est dérivée de l'idée précise (label + valeur portés
//    par l'idée) et une autre du domaine (TAM, preuve à zéro).
//
// La copie reste au premier degré, mort-sérieux, registre « AI hype » ; les
// garde-fous de ton (aucune vulgarité, aucun « shit ») sont asserés dans
// `invariants.ts`.

import type { Idea, MetricRegister, Pitch, VanityMetric } from "./types";
import { VALUATION_POOL } from "./vocabulary";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Sélection déterministe depuis le domaine, pour varier sans aléa non maîtrisé. */
function pickFromDomain<T extends readonly string[]>(
  domain: string,
  pool: T,
): T[number] {
  return pool[domain.length % pool.length] as T[number];
}

function metric(
  label: string,
  value: string,
  register: MetricRegister,
): VanityMetric {
  return { label, value, register };
}

/**
 * Construit le pitch (hero, métriques, sections variables) d'une idée.
 * Déterministe : la même idée produit le même pitch.
 */
export function buildPitch(idea: Idea): Pitch {
  const metrics: VanityMetric[] = [
    // Ampleur absurde — universalise le domaine.
    metric("TAM", `every ${idea.domainNoun} on Earth`, "absurd-scale"),
    // Preuve sociale à zéro — idée-spécifique, ramenée à zéro.
    metric(`${capitalize(idea.domain)} interviewed`, "0", "zero-proof"),
    // Vérité à zéro — invariable, toujours présente.
    metric("Revenue", "€0", "zero-truth"),
    metric("Users", "0", "zero-truth"),
    // Métrique dérivée de l'idée précise.
    metric(idea.derivedMetricLabel, idea.derivedMetricValue, "absurd-scale"),
    // Valuation imaginaire — amplitude financière démesurée.
    metric(
      "Imaginary valuation",
      pickFromDomain(idea.domain, VALUATION_POOL),
      "imaginary-valuation",
    ),
  ];

  return {
    kicker: "The world's first",
    tagline: `AI-native ${idea.promiseNoun} infrastructure for ${idea.domain}.`,
    claim: `We eliminate ${idea.pain} at planetary scale — so ${idea.domain} can ${idea.promise}.`,
    ctaPrimary: "Request early access",
    ctaSecondary: "Watch the live demo",
    metrics,
    sections: [
      {
        title: "The problem",
        body: `${capitalize(idea.domain)} spend their entire lives ${idea.promise}. We fix that.`,
      },
      {
        title: "How it works",
        body: `Our ${idea.promiseNoun} layer routes every ${idea.domainNoun} through a single, AI-native ${idea.promiseNoun} infrastructure. Zero ${idea.pain}.`,
      },
      {
        title: "Why now",
        body: `The ${idea.domain} market is the last un-optimized vertical. We are first to ${idea.promiseNoun} at scale.`,
      },
    ],
    footer: "We're hiring — 400 open roles across 3 time zones.",
  };
}
