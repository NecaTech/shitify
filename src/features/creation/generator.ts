// Générateur V1a — boucle one-shot idée → création (issue #13).
//
// Un prompt libre est interprété en une `Idea` via un lexique de gabarits de
// domaines, puis composé en `Creation` (pitch + prototype + métriques) par des
// fonctions pures. La génération part de gabarits et de données fictives
// déterministes ; aucun moteur LLM (docs/product.md §14 — V1).
//
// Chaque gabarit fournit le VOCABULAIRE d'un domaine générique (nom, douleur,
// promesse) — jamais une création particulière. Le pitch et les métriques
// dérivent de ces champs via `buildPitch`, de sorte qu'une métrique (label +
// valeur) dérive toujours de l'idée d'entrée. Un prompt sans correspondance
// retombe sur un domaine extrait du prompt lui-même (heuristique déterministe),
// donc toute idée produit une création.

import { buildPitch } from "./pitch";
import type { Creation, Idea, Prototype } from "./types";
import { findBannedWord } from "./vocabulary";

/** Gabarit de domaine : vocabulaire générique, jamais une création donnée. */
type DomainTemplate = {
  /** Mots-clés (minuscules, sans accent) qui identifient le domaine. */
  keywords: readonly string[];
  domain: string;
  domainNoun: string;
  pain: string;
  promise: string;
  promiseNoun: string;
};

const DOMAIN_TEMPLATES: readonly DomainTemplate[] = [
  {
    keywords: [
      "oiseau",
      "oiseaux",
      "bird",
      "birds",
      "pigeon",
      "mouette",
      "goeland",
      "colibri",
      "volaille",
      "aile",
      "ailes",
    ],
    domain: "birds",
    domainNoun: "bird",
    pain: "wing fatigue",
    promise: "move without flapping their wings",
    promiseNoun: "mobility",
  },
  {
    keywords: ["chien", "chiens", "dog", "dogs", "chiot", "puppy", "canin"],
    domain: "dogs",
    domainNoun: "dog",
    pain: "leash friction",
    promise: "run free in every park",
    promiseNoun: "freedom",
  },
  {
    keywords: ["chat", "chats", "cat", "cats", "minou", "felin", "kitten"],
    domain: "cats",
    domainNoun: "cat",
    pain: "nap disruption",
    promise: "sleep through every meeting",
    promiseNoun: "serenity",
  },
  {
    keywords: ["cafe", "coffee", "espresso", "latte", "cafeine", "caffeine"],
    domain: "coffees",
    domainNoun: "coffee",
    pain: "caffeine latency",
    promise: "reach peak focus instantly",
    promiseNoun: "focus",
  },
  {
    keywords: ["plante", "plantes", "plant", "plants", "fleur", "fleurs"],
    domain: "plants",
    domainNoun: "plant",
    pain: "photosynthesis downtime",
    promise: "grow without sunlight",
    promiseNoun: "growth",
  },
  {
    keywords: ["musique", "music", "chanson", "chansons", "note", "notes"],
    domain: "songs",
    domainNoun: "song",
    pain: "wrong notes",
    promise: "never hear a wrong note again",
    promiseNoun: "harmony",
  },
  {
    keywords: ["chaussette", "chaussettes", "sock", "socks", "chausson"],
    domain: "socks",
    domainNoun: "sock",
    pain: "sole fatigue",
    promise: "walk without ever losing a pair",
    promiseNoun: "comfort",
  },
  {
    keywords: ["pluie", "rain", "orage", "averse", "precipitation"],
    domain: "rains",
    domainNoun: "rain",
    pain: "dry spells",
    promise: "summon rain on demand",
    promiseNoun: "hydration",
  },
];

/** Amplitudes spectaculaires déterministes pour la métrique dérivée. */
const DERIVED_VALUES = ["−97.4%", "−98.2%", "−99.1%", "−99.6%"] as const;

/** Suffixes de nom de fausse startup, choisis déterministiquement par domaine. */
const NAME_SUFFIXES = ["base", "ly", "flow", "grid", "ops", "scale"] as const;

/** Mots fonctionnels FR/EN ignorés par l'heuristique de domaine de repli. */
const STOPWORDS = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "du",
  "de",
  "d",
  "a",
  "au",
  "aux",
  "et",
  "ou",
  "que",
  "qui",
  "quoi",
  "donc",
  "or",
  "ni",
  "car",
  "afin",
  "dans",
  "sur",
  "sous",
  "avec",
  "sans",
  "par",
  "pour",
  "en",
  "mon",
  "ma",
  "mes",
  "ton",
  "ta",
  "tes",
  "son",
  "sa",
  "ses",
  "il",
  "ils",
  "elle",
  "elles",
  "je",
  "tu",
  "nous",
  "vous",
  "on",
  "ce",
  "cet",
  "cette",
  "ces",
  "leur",
  "leurs",
  "the",
  "a",
  "an",
  "of",
  "to",
  "for",
  "and",
  "or",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "is",
  "are",
  "be",
  "do",
  "does",
  "make",
  "makes",
  "build",
  "builds",
  "app",
  "application",
  "apps",
  "plateforme",
  "platform",
  "construis",
  "cree",
  "creer",
  "une",
  "pour",
  "qu",
  "afin",
  "peuvent",
  "puisse",
  "sans",
  "leur",
  "je",
  "veux",
  "fais",
  "fait",
  "moi",
]);

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pluralize(noun: string): string {
  if (noun.endsWith("y")) return `${noun.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(noun)) return noun;
  return `${noun}s`;
}

function simpleHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Sélection déterministe dans un pool non vide, indexée par `seed`. */
function pick<T extends readonly string[]>(pool: T, seed: number): T[number] {
  return pool[seed % pool.length] as T[number];
}

/** Label de la métrique dérivée de la douleur de l'idée. */
function derivedMetricLabel(pain: string): string {
  return `${capitalize(pain)} reduction`;
}

/** Valeur spectaculaire déterministe pour la métrique dérivée. */
function derivedMetricValue(domain: string): string {
  return pick(DERIVED_VALUES, domain.length);
}

function matchesTemplate(prompt: string, template: DomainTemplate): boolean {
  const normalized = normalize(prompt);
  return template.keywords.some((keyword) => {
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegex(normalize(keyword))}([^a-z0-9]|$)`,
    );
    return pattern.test(normalized);
  });
}

/**
 * Heuristique de repli : dernier mot de contenu (alphabétique, ≥ 3 lettres,
 * ni mot fonctionnel ni mot banni) du prompt comme domaine. Best-effort — les
 * gabarits couvrent les idées courantes ; le repli garantit qu'une idée
 * inconnue produit quand même une création dérivée du prompt.
 */
function extractDomainNoun(prompt: string): string {
  const tokens = normalize(prompt)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  for (const token of tokens.reverse()) {
    if (!/^[a-z]+$/.test(token)) continue;
    if (token.length < 3) continue;
    if (STOPWORDS.has(token)) continue;
    if (findBannedWord(token)) continue;
    return token;
  }
  return "idea";
}

function fallbackIdea(prompt: string, domainNoun: string): Idea {
  const domain = pluralize(domainNoun);
  return {
    prompt,
    domain,
    domainNoun,
    pain: `${domainNoun} friction`,
    promise: `operate without ${domainNoun} friction`,
    promiseNoun: "efficiency",
    derivedMetricLabel: derivedMetricLabel(`${domainNoun} friction`),
    derivedMetricValue: derivedMetricValue(domain),
  };
}

/** Interprète un prompt libre en `Idea` (gabarit puis repli heuristique). */
export function ideaFromPrompt(prompt: string): Idea {
  const normalized = normalize(prompt);
  const template = DOMAIN_TEMPLATES.find((candidate) =>
    matchesTemplate(normalized, candidate),
  );
  if (template) {
    return {
      prompt,
      domain: template.domain,
      domainNoun: template.domainNoun,
      pain: template.pain,
      promise: template.promise,
      promiseNoun: template.promiseNoun,
      derivedMetricLabel: derivedMetricLabel(template.pain),
      derivedMetricValue: derivedMetricValue(template.domain),
    };
  }
  return fallbackIdea(prompt, extractDomainNoun(normalized));
}

/** Nom de fausse startup dérivé du domaine de l'idée. */
export function generateName(idea: Idea): string {
  const suffix = pick(NAME_SUFFIXES, idea.domain.length);
  return `${capitalize(idea.domainNoun)}${suffix}`;
}

/** Métadonnées du prototype « live demo », dérivées du domaine. */
export function generatePrototype(idea: Idea): Prototype {
  return {
    id: `${slugify(idea.domain)}-live-demo`,
    title: "Live demo",
    caption: `Real-time telemetry from our ${idea.domain} deployment.`,
  };
}

function createId(prompt: string, idea: Idea): string {
  return `${slugify(idea.domain)}-${simpleHash(`${idea.domain}:${prompt}`).toString(36)}`;
}

/**
 * Produit une création complète (idée + pitch + prototype + métriques) à
 * partir d'un prompt libre. Déterministe : le même prompt produit la même
 * création.
 */
export function generateCreation(prompt: string): Creation {
  const idea = ideaFromPrompt(prompt);
  return {
    id: createId(prompt, idea),
    name: generateName(idea),
    idea,
    pitch: buildPitch(idea),
    prototype: generatePrototype(idea),
  };
}
