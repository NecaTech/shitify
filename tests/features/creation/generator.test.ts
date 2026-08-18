import { describe, expect, it } from "vitest";
import {
  generateCreation,
  generateName,
  ideaFromPrompt,
  validateCreation,
} from "@/features/creation";

describe("generateCreation — idée → création (V1a)", () => {
  it("produit une création valide à partir d'une idée libre", () => {
    const creation = generateCreation(
      "Construis une plateforme de transport pour oiseaux afin qu'ils puissent se déplacer sans fatiguer leurs ailes.",
    );

    expect(validateCreation(creation)).toEqual([]);
  });

  it("dérive le pitch de l'idée (métrique + domaine de l'idée)", () => {
    const creation = generateCreation(
      "Une plateforme de transport pour oiseaux.",
    );
    const { idea, pitch } = creation;

    // Au moins une métrique porte le label et la valeur de l'idée interprétée.
    expect(pitch.metrics).toContainEqual({
      label: idea.derivedMetricLabel,
      value: idea.derivedMetricValue,
      register: "absurd-scale",
    });

    // Le label de la métrique dérive de la douleur de l'idée.
    expect(idea.derivedMetricLabel.toLowerCase()).toContain(
      idea.pain.toLowerCase(),
    );

    // Le tagline référence le domaine de l'idée.
    expect(pitch.tagline).toContain(idea.domain);
  });

  it("reste déterministe : le même prompt produit la même création", () => {
    const prompt = "Une app pour apprendre la guitare aux poissons.";
    expect(generateCreation(prompt)).toEqual(generateCreation(prompt));
  });

  it("varie entre deux idées (nom et tagline différents)", () => {
    const birds = generateCreation("Une plateforme de transport pour oiseaux.");
    const dogs = generateCreation("Une app de promenade pour chiens pressés.");

    expect(birds.name).not.toBe(dogs.name);
    expect(birds.pitch.tagline).not.toBe(dogs.pitch.tagline);
  });

  it("produit une copie de pitch sans vulgarité ni « shit »", () => {
    const creation = generateCreation(
      "Une app de livraison de café pour développeurs fatigués.",
    );

    const banned = validateCreation(creation).filter(
      (violation) => violation.code === "banned-word",
    );
    expect(banned).toEqual([]);
  });
});

describe("generateCreation — repli heuristique", () => {
  it("produit une création dérivée du prompt même sans gabarit connu", () => {
    const creation = generateCreation(
      "Une app pour lire dans les pensées des escargots.",
    );

    expect(validateCreation(creation)).toEqual([]);
    expect(creation.idea.domain).toBe("escargots");
    expect(creation.pitch.tagline).toContain("escargots");
  });

  it("ne laisse jamais un mot banni devenir le domaine de repli", () => {
    const creation = generateCreation("Une app de merde.");

    expect(creation.idea.domain).not.toBe("merde");
    expect(validateCreation(creation)).toEqual([]);
  });
});

describe("ideaFromPrompt / generateName", () => {
  it("reconnaît un gabarit de domaine par ses mots-clés", () => {
    const idea = ideaFromPrompt("Une plateforme de transport pour oiseaux.");

    expect(idea.domain).toBe("birds");
    expect(idea.pain).toBe("wing fatigue");
  });

  it("dérive le nom de fausse startup du domaine", () => {
    const idea = ideaFromPrompt("Une plateforme de transport pour oiseaux.");
    expect(generateName(idea)).toBe("Birdscale");
  });
});
