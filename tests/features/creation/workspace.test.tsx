/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CreationWorkspace } from "@/features/creation/components/CreationWorkspace";
import { PrototypeCanvas } from "@/features/creation/components/PrototypeCanvas";
import { generateCreation } from "@/features/creation";

const BIRDS_PROMPT = "Une plateforme de transport pour oiseaux.";

afterEach(cleanup);

function submitIdea(prompt: string) {
  fireEvent.change(screen.getByLabelText("Votre idée"), {
    target: { value: prompt },
  });
  const form = screen
    .getByRole("button", { name: /Brûler mes tokens/i })
    .closest("form") as HTMLFormElement;
  fireEvent.submit(form);
}

describe("PrototypeCanvas — prototype interactif", () => {
  it("est interactif : déploie des données fictives dérivées de l'idée", () => {
    render(<PrototypeCanvas creation={generateCreation(BIRDS_PROMPT)} />);

    fireEvent.click(screen.getByRole("button", { name: /Deploy/i }));

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Wing fatigue reduction");
    expect(status).toHaveTextContent("€0");
    expect(status).toHaveTextContent("Active birds");
  });
});

describe("CreationWorkspace — postures itérer / consulter", () => {
  it("soumet une idée et produit une création (pitch + prototype enchâssé)", () => {
    render(<CreationWorkspace />);

    submitIdea(BIRDS_PROMPT);

    // Le pitch dérive de l'idée : tagline + prototype interactif sur le canvas.
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /AI-native mobility infrastructure for birds/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Deploy/i })).toBeInTheDocument();
  });

  it("« Consulter » affiche le prototype seul, sans conversation", () => {
    render(<CreationWorkspace />);
    submitIdea(BIRDS_PROMPT);

    fireEvent.click(screen.getByRole("button", { name: "Consulter" }));

    expect(screen.queryByLabelText("Conversation")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Prototype")).toBeInTheDocument();
    // Le prototype reste interactif en posture « consulter ».
    expect(screen.getByRole("button", { name: /Deploy/i })).toBeInTheDocument();
  });

  it("« Itérer » garde le canvas et la conversation (contrôle secondaire)", () => {
    render(<CreationWorkspace />);

    expect(screen.getByRole("button", { name: "Itérer" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText("Conversation")).toBeInTheDocument();
    expect(screen.getByLabelText("Votre idée")).toBeInTheDocument();
  });
});
