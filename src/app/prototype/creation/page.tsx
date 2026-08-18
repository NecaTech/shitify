// PROTOTYPE — throwaway. Route de dogfood qui matérialise la création canonique
// « transport pour oiseaux » (issue #12, V0) : pitch landing + prototype
// interactif enchâssé, chrome FR / performance EN. À jeter quand V1 prend le
// relais ; ne pas lier cette route depuis la navigation expédiée.

import type { Metadata } from "next";

import { ChromeHeader } from "@/features/creation/components/ChromeHeader";
import { PitchLanding } from "@/features/creation/components/PitchLanding";
import { creation } from "./content";
import { BirdMobilityDemo } from "./interactive-prototype";

export const metadata: Metadata = {
  title: "Wingbase — AI-native mobility infrastructure for birds",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="bg-brand-void min-h-dvh">
      <ChromeHeader />
      <PitchLanding creation={creation} demo={<BirdMobilityDemo />} />
    </main>
  );
}
