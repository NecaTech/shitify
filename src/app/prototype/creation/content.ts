// PROTOTYPE — throwaway. Contenu de dogfood « transport pour oiseaux »
// (docs/product.md §3 — exemple canonique), simple démonstration jetable du
// format V0 (issue #12). Ne pas expédier en production ; ne pas en faire une
// fonctionnalité produit.

import { buildPitch } from "@/features/creation";
import type { Creation, Idea } from "@/features/creation";

const idea: Idea = {
  prompt:
    "Construis une plateforme de transport pour oiseaux afin qu'ils puissent se déplacer sans fatiguer leurs ailes.",
  domain: "birds",
  domainNoun: "bird",
  pain: "wing fatigue",
  promise: "move without flapping their wings",
  promiseNoun: "mobility",
  derivedMetricLabel: "Wing fatigue reduction",
  derivedMetricValue: "−98.2%",
};

export const creation: Creation = {
  id: "dogfood-transport-pour-oiseaux",
  name: "Wingbase",
  idea,
  pitch: buildPitch(idea),
  prototype: {
    id: "wingbase-flight-router",
    title: "Live demo",
    caption: "Real-time telemetry from our canary deployment.",
  },
};
