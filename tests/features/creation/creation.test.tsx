/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChromeHeader } from "@/features/creation/components/ChromeHeader";
import { PitchLanding } from "@/features/creation/components/PitchLanding";
import { buildPitch } from "@/features/creation";
import type { Creation, Idea } from "@/features/creation";

const birds: Idea = {
  prompt: "Une plateforme de transport pour oiseaux.",
  domain: "birds",
  domainNoun: "bird",
  pain: "wing fatigue",
  promise: "move without flapping their wings",
  promiseNoun: "mobility",
  derivedMetricLabel: "Wing fatigue reduction",
  derivedMetricValue: "−98.2%",
};

const creation: Creation = {
  id: "test-creation",
  name: "Wingbase",
  idea: birds,
  pitch: buildPitch(birds),
  prototype: {
    id: "proto",
    title: "Live demo",
    caption: "Real-time telemetry from our canary deployment.",
  },
};

afterEach(cleanup);

describe("chrome FR / performance EN", () => {
  it("rend le chrome en français (noms de marque anglais incrustés)", () => {
    render(<ChromeHeader />);

    expect(screen.getByText("Shitify")).toBeInTheDocument();
    expect(screen.getByText("Génération")).toBeInTheDocument();
    expect(screen.getByText("Mes Bullshits")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Brûler mes tokens/i }),
    ).toBeInTheDocument();
  });

  it("rend le pitch en anglais avec hero, tagline et métriques", () => {
    render(<PitchLanding creation={creation} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /AI-native mobility infrastructure for birds/i,
      }),
    ).toBeInTheDocument();

    // Vérité à zéro. « Users = 0 » est scopé à sa carte pour éviter l'ambiguïté
    // avec « Birds interviewed = 0 ».
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("€0")).toBeInTheDocument();
    const usersCard = screen.getByText("Users").parentElement;
    expect(usersCard).not.toBeNull();
    expect(within(usersCard as HTMLElement).getByText("0")).toBeInTheDocument();

    // Métrique dérivée de l'idée.
    expect(screen.getByText("Wing fatigue reduction")).toBeInTheDocument();
    expect(screen.getByText("−98.2%")).toBeInTheDocument();
  });

  it("enchâsse le prototype interactif comme « live demo »", () => {
    render(
      <PitchLanding
        creation={creation}
        demo={<button type="button">Plan migration</button>}
      />,
    );

    expect(screen.getByLabelText("Live demo")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Plan migration/i }),
    ).toBeInTheDocument();
  });
});
