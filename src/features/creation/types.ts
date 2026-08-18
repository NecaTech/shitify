// Format canonique d'une création Shitify.
//
// Une création = idée + prototype + pitch + métriques. Ce fichier fige la
// FORME de l'artefact partageable (docs/product.md §14 — V0), sans moteur de
// génération ni persistance. Le moteur (V1+) produira ces mêmes objets.

/**
 * Registre d'une métrique vanity (docs/product.md, issue #11).
 *
 * - `absurd-scale` : ampleur absurde qui universalise domaine et promesse.
 * - `zero-truth` : contrepoint honnête, invariable (Revenue 0 €, Users 0).
 * - `zero-proof` : « preuve » idée-spécifique ramenée à zéro.
 * - `imaginary-valuation` : amplitude financière démesurée.
 */
export type MetricRegister =
  | "absurd-scale"
  | "zero-truth"
  | "zero-proof"
  | "imaginary-valuation";

export type VanityMetric = {
  label: string;
  value: string;
  register: MetricRegister;
};

/**
 * L'idée source de la création. Le domaine et la promesse sont les champs dont
 * dérivent le pitch et les métriques idée-spécifiques. En V0 ils sont rédigés
 * par le contenu de dogfood ; en V1 ils seront extraits du prompt libre.
 */
export type Idea = {
  /** Le prompt libre de l'utilisateur, conservé tel quel. */
  prompt: string;
  /** Le domaine au pluriel (minuscule), ex. `birds`. */
  domain: string;
  /** Le domaine au singulier (minuscule), ex. `bird`. */
  domainNoun: string;
  /** La douleur éliminée (groupe nominal), ex. `wing fatigue`. */
  pain: string;
  /** La promesse rédigée, ex. `move without flapping their wings`. */
  promise: string;
  /** La forme nominale de la promesse, ex. `mobility`. */
  promiseNoun: string;
  /** Libellé de la métrique dérivée de l'idée, ex. `Wing fatigue reduction`. */
  derivedMetricLabel: string;
  /** Valeur (spectaculaire) de la métrique dérivée, ex. `−98.2%`. */
  derivedMetricValue: string;
};

export type PitchSection = {
  title: string;
  body: string;
};

export type Pitch = {
  kicker: string;
  tagline: string;
  claim: string;
  ctaPrimary: string;
  ctaSecondary: string;
  metrics: VanityMetric[];
  sections: PitchSection[];
  footer: string;
};

export type Prototype = {
  /** Identifiant stable de l'artefact prototype. */
  id: string;
  /** Titre affiché dans le cadre « live demo ». */
  title: string;
  /** Légende de la démo, registre startup mort-sérieux. */
  caption: string;
};

export type Creation = {
  id: string;
  /** Nom de marque de la fausse startup (voix performance). */
  name: string;
  idea: Idea;
  pitch: Pitch;
  prototype: Prototype;
};
