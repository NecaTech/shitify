import { describe, expect, it } from "vitest";
import {
  buildPitch,
  findBannedWord,
  validateCreation,
} from "@/features/creation";
import type { Creation, Idea } from "@/features/creation";

const birds: Idea = {
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

const penguins: Idea = {
  prompt: "Une app de livraison de glaçons pour pingouins pressés.",
  domain: "penguins",
  domainNoun: "penguin",
  pain: "ground friction",
  promise: "slide without walking",
  promiseNoun: "mobility",
  derivedMetricLabel: "Belly slide efficiency",
  derivedMetricValue: "+99.9%",
};

function makeCreation(idea: Idea, patch?: Partial<Creation>): Creation {
  return {
    id: "test-creation",
    name: "TestCo",
    idea,
    pitch: buildPitch(idea),
    prototype: {
      id: "proto",
      title: "Live demo",
      caption: "Real-time telemetry.",
    },
    ...patch,
  };
}

describe("buildPitch — invariants du pitch", () => {
  it("contient toujours la vérité à zéro (Revenue 0 €, Users 0)", () => {
    const pitch = buildPitch(birds);
    const truth = pitch.metrics.filter((m) => m.register === "zero-truth");

    expect(truth).toContainEqual({
      label: "Revenue",
      value: "€0",
      register: "zero-truth",
    });
    expect(truth).toContainEqual({
      label: "Users",
      value: "0",
      register: "zero-truth",
    });
  });

  it("dérive au moins une métrique de l'idée précise", () => {
    const pitch = buildPitch(birds);

    expect(pitch.metrics).toContainEqual({
      label: "Wing fatigue reduction",
      value: "−98.2%",
      register: "absurd-scale",
    });
  });

  it("dérive aussi une métrique du domaine (TAM, preuve à zéro)", () => {
    const pitch = buildPitch(birds);

    expect(pitch.metrics).toContainEqual({
      label: "TAM",
      value: "every bird on Earth",
      register: "absurd-scale",
    });
    expect(pitch.metrics).toContainEqual({
      label: "Birds interviewed",
      value: "0",
      register: "zero-proof",
    });
  });

  it("produit une copie sans vulgarité ni « shit »", () => {
    const creation = makeCreation(birds);
    const violations = validateCreation(creation).filter(
      (v) => v.code === "banned-word",
    );

    expect(violations).toEqual([]);
  });

  it("varie la tagline entre deux idées proches (anti-répétition locale)", () => {
    expect(buildPitch(birds).tagline).not.toBe(buildPitch(penguins).tagline);
  });
});

describe("findBannedWord — frontière « shit »", () => {
  it("signale le mot banni isolé", () => {
    expect(findBannedWord("this is total shit")).toBe("shit");
  });

  it("n'éclate pas sur un nom de marque (Shitify)", () => {
    expect(findBannedWord("Built with Shitify")).toBeNull();
    expect(findBannedWord("My Bullshits")).toBeNull();
  });

  it("est insensible à la casse", () => {
    expect(findBannedWord("This is SHIT")).toBe("shit");
  });
});

describe("validateCreation — forme d'une création", () => {
  it("accepte une création conforme", () => {
    expect(validateCreation(makeCreation(birds))).toEqual([]);
  });

  it("refuse une création sans vérité à zéro", () => {
    const pitch = buildPitch(birds);
    const creation = makeCreation(birds, {
      pitch: {
        ...pitch,
        metrics: pitch.metrics.filter((m) => m.register !== "zero-truth"),
      },
    });

    const codes = validateCreation(creation).map((v) => v.code);
    expect(codes).toContain("missing-zero-truth:revenue");
    expect(codes).toContain("missing-zero-truth:users");
  });

  it("refuse une création sans métrique dérivée de l'idée", () => {
    const pitch = buildPitch(birds);
    const creation = makeCreation(birds, {
      pitch: {
        ...pitch,
        metrics: pitch.metrics.filter(
          (m) => m.label !== birds.derivedMetricLabel,
        ),
      },
    });

    const codes = validateCreation(creation).map((v) => v.code);
    expect(codes).toContain("missing-idea-derived-metric");
  });

  it("refuse une copie de pitch contenant une vulgarité", () => {
    const pitch = buildPitch(birds);
    const creation = makeCreation(birds, {
      pitch: {
        ...pitch,
        sections: [
          { title: "The problem", body: "Birds are tired of this shit." },
        ],
      },
    });

    const codes = validateCreation(creation).map((v) => v.code);
    expect(codes).toContain("banned-word");
  });
});
