// Garde-fous de la FORME d'une création et de ses invariants de ton.
//
// Ces assertions portent sur le comportement observable de la frontière
// `création` (issue #11 — « La seam de test ») : vérité à zéro, métrique
// dérivée de l'idée, absence de vulgarité et de « shit » dans la copie.

import { findBannedWord } from "./vocabulary";
import type { Creation, VanityMetric } from "./types";

export type Violation = {
  code: string;
  message: string;
};

const ZERO_TRUTH: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Revenue", value: "€0" },
  { label: "Users", value: "0" },
];

/** Toute la copie de performance (pitch + nom de marque de la fausse startup). */
export function pitchCopy(creation: Creation): string[] {
  const { pitch } = creation;
  return [
    creation.name,
    pitch.kicker,
    pitch.tagline,
    pitch.claim,
    pitch.ctaPrimary,
    pitch.ctaSecondary,
    ...pitch.metrics.flatMap((m) => [m.label, m.value]),
    ...pitch.sections.flatMap((s) => [s.title, s.body]),
    pitch.footer,
  ];
}

function hasMetric(
  metrics: VanityMetric[],
  predicate: (m: VanityMetric) => boolean,
): boolean {
  return metrics.some(predicate);
}

/**
 * Valide une création contre les invariants du format. Retourne la liste des
 * violations ; une création conforme retourne `[]`.
 */
export function validateCreation(creation: Creation): Violation[] {
  const violations: Violation[] = [];
  const metrics = creation.pitch.metrics;

  for (const truth of ZERO_TRUTH) {
    const present = hasMetric(
      metrics,
      (m) =>
        m.register === "zero-truth" &&
        m.label === truth.label &&
        m.value === truth.value,
    );
    if (!present) {
      violations.push({
        code: `missing-zero-truth:${truth.label.toLowerCase()}`,
        message: `Le pitch doit contenir la vérité à zéro « ${truth.label} ${truth.value} ».`,
      });
    }
  }

  const derived = hasMetric(
    metrics,
    (m) =>
      m.label === creation.idea.derivedMetricLabel &&
      m.value === creation.idea.derivedMetricValue,
  );
  if (!derived) {
    violations.push({
      code: "missing-idea-derived-metric",
      message: `Le pitch doit contenir la métrique dérivée de l'idée « ${creation.idea.derivedMetricLabel} ».`,
    });
  }

  for (const text of pitchCopy(creation)) {
    const banned = findBannedWord(text);
    if (banned) {
      violations.push({
        code: "banned-word",
        message: `La copie du pitch contient le terme interdit « ${banned} ».`,
      });
      break;
    }
  }

  return violations;
}
