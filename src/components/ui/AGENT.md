# Primitives UI (`src/components/ui/`)

## Contrat

- Composants domain-agnostic uniquement.
- Aucun import depuis `src/features`, `src/app`, `src/lib/db` ou `src/lib/auth`.
- Les composants doivent rester contrôlables par props explicites et refs si nécessaire.
- Les variants passent par `cva`, `cn()` et les tokens Tailwind.

## Design

- Utiliser les tokens sémantiques (`bg-background`, `text-foreground`, `border-input`, etc.).
- Ne pas introduire de couleur brute ou de style inline.
- Préserver l'accessibilité native : labels, focus visible, disabled states, aria si nécessaire.

## Anti-contournement

- Ne jamais ajouter une prop métier ou un cas client spécifique dans une primitive.
- Si une feature a besoin d'un rendu spécial, créer un composant dans `features/<feature>/components`.
