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

## Media URLs

- Une primitive qui affiche un média fourni par l'appelant doit préserver l'URL
  reçue (`src`) dans le DOM, sauf contrat explicite et testé.
- Ne pas importer `next/image` dans `src/components/ui`: l'optimiseur peut
  réécrire des URLs same-origin, signées ou servies par route applicative.
- Si une feature veut optimiser des images, le faire dans la feature et ajouter
  un test DOM qui vérifie l'URL rendue lorsque l'accès à la ressource dépend de
  l'URL exacte.

## Machine-Enforced Rules

- `tests/quality/ui-media-url-boundary.test.ts` refuse `next/image` dans les
  primitives UI.
