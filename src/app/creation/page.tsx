import type { Metadata } from "next";

import { CreationWorkspace } from "@/features/creation/components/CreationWorkspace";

// V1a — boucle one-shot idée → création (issue #13). Surface publique de
// validation (local-first, sans auth ni DB). Le canvas principal porte le
// prototype ; la conversation reste un contrôle secondaire en langage naturel.

export const metadata: Metadata = {
  title: "Nouvelle création",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CreationWorkspace />;
}
