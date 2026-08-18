"use client";

// Espace de travail V1a (issue #13) — la boucle one-shot idée → création, avec
// les deux postures :
//
// - « Itérer » : le canvas principal (pitch landing + prototype interactif)
//   encadré par la conversation (contrôle secondaire, langage naturel seul) ;
// - « Consulter » : le prototype seul, plein écran, toujours interactif.
//
// Aucun IDE, aucune arborescence, aucune édition de code : la conversation
// n'expose que du langage naturel. La génération est locale (fonction pure
// `generateCreation`) — pas de persistance, pas d'auth (V1a reste local-first).

import { useState, type FormEvent } from "react";
import { generateCreation } from "../generator";
import type { Creation } from "../types";
import { PitchLanding } from "./PitchLanding";
import { PrototypeCanvas } from "./PrototypeCanvas";

type Posture = "iterer" | "consulter";
type Message = { role: "user" | "system"; text: string };

const POSTURES: ReadonlyArray<{ value: Posture; label: string }> = [
  { value: "iterer", label: "Itérer" },
  { value: "consulter", label: "Consulter" },
];

/** Compte de tokens fictif et déterministe, dérivé de la longueur du prompt. */
function burnCount(prompt: string): string {
  return (1280 + prompt.length * 64).toLocaleString("fr-FR");
}

export function CreationWorkspace() {
  const [posture, setPosture] = useState<Posture>("iterer");
  const [prompt, setPrompt] = useState("");
  const [creation, setCreation] = useState<Creation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value) return;

    const next = generateCreation(value);
    setCreation(next);
    setMessages((current) => [
      ...current,
      { role: "user", text: value },
      {
        role: "system",
        text: `Création matérialisée · ${next.name}. ${burnCount(value)} tokens brûlés.`,
      },
    ]);
    setPrompt("");
  }

  return (
    <div className="bg-brand-void text-brand-void-foreground min-h-dvh">
      <header className="border-brand-void-foreground/15 bg-brand-void/40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="from-brand-neon-pink via-brand-neon-yellow to-brand-neon-mint bg-linear-to-r bg-clip-text text-2xl font-black tracking-tight text-transparent">
            Shitify
          </span>

          <div
            role="group"
            aria-label="Posture"
            className="border-brand-void-foreground/15 flex rounded-full border p-1"
          >
            {POSTURES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={posture === option.value}
                onClick={() => setPosture(option.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-black transition ${
                  posture === option.value
                    ? "from-brand-neon-pink to-brand-neon-yellow text-brand-void bg-linear-to-r"
                    : "text-brand-void-foreground/60 hover:text-brand-void-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {posture === "iterer" ? (
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-[1fr_360px]">
          <section aria-label="Canvas">
            {creation ? (
              <PitchLanding
                creation={creation}
                demo={<PrototypeCanvas creation={creation} />}
              />
            ) : (
              <EmptyState />
            )}
          </section>

          <aside
            aria-label="Conversation"
            className="border-brand-void-foreground/15 bg-brand-void/40 flex h-fit flex-col rounded-2xl border p-4"
          >
            <h2 className="text-brand-neon-mint text-sm font-black tracking-widest uppercase">
              Conversation
            </h2>

            <div
              aria-live="polite"
              className="text-brand-void-foreground/70 mt-4 flex min-h-48 flex-col gap-3 text-sm"
            >
              {messages.length === 0 ? (
                <p className="text-brand-void-foreground/40">
                  Aucune génération pour l&apos;instant. Décrivez votre idée.
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={
                      message.role === "user"
                        ? "bg-brand-void-foreground/5 rounded-xl px-3 py-2"
                        : "text-brand-neon-mint px-1 font-semibold"
                    }
                  >
                    {message.text}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
              <label className="text-brand-void-foreground/60 text-xs font-bold uppercase">
                Votre idée
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Décrivez votre pire idée. Sans retenue."
                  rows={3}
                  className="border-brand-void-foreground/20 bg-brand-void-foreground/5 text-brand-void-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
                />
              </label>
              <button
                type="submit"
                className="from-brand-neon-pink to-brand-neon-yellow text-brand-void shadow-neon-pink rounded-full bg-linear-to-r px-4 py-2.5 text-sm font-black transition hover:brightness-110"
              >
                Brûler mes tokens 🔥
              </button>
            </form>
          </aside>
        </div>
      ) : (
        <section
          aria-label="Prototype"
          className="mx-auto max-w-5xl px-6 py-10"
        >
          {creation ? <PrototypeCanvas creation={creation} /> : <EmptyState />}
        </section>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-brand-void-foreground/15 bg-brand-void/40 flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border px-6 py-16 text-center">
      <p className="text-brand-neon-mint text-sm font-black tracking-widest uppercase">
        Service indisponible
      </p>
      <h1 className="text-2xl font-black">Aucune création active</h1>
      <p className="text-brand-void-foreground/60 max-w-md text-sm font-semibold">
        Saisissez une idée pour initier la génération. Aucun jeton ne sera
        épargné.
      </p>
    </div>
  );
}
