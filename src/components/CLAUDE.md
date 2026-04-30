# Composants UI (`src/components/`)

## Structure

- `ui/` — Composants headless/radix (shadcn). Domain-agnostic, copier-coller modifiables.
- `layout/` — Composants de structure (header, footer, sidebar, navigation).

## Regles

- **Aucune logique metier** — Les composants ici ne dependent d'aucune feature.
- **Props explicites** — Pas de `spread` opaque, chaque prop est declaree.
- **Styling** — Classes Tailwind uniquement. Jamais de `style` inline.
- **Dark mode** — Gerer via les variables semantiques (`bg-background`), pas de `dark:`.
- **Responsive** — Classes Tailwind (`sm:`, `md:`, `lg:`), pas de JS conditionnel.
- **Composants specifiques a une feature** → `features/<feature>/components/`, pas ici.

## Variants (shadcn)

- Utiliser `cva` ou le pattern `cn()` pour les variants de composants.
- Les classes conditionnelles passent par `clsx` / `tailwind-merge`.
