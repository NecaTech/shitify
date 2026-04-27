# components/

- `ui/` et `layout/` sont domain-agnostic — si props spécifiques à une feature → `features/<feature>/components/`
- Tailwind CSS 4, utility classes uniquement — pas de `style` props inline
- Dark mode et responsive via Tailwind modifiers, pas de JS conditionnels
