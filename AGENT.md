# AGENT.md — NecaTech Boilerplate

## Detection Boilerplate

Si `git remote get-url origin` contient `necatech-boilerplate` ou que `git remote` est vide, et que la demande ne concerne pas le boilerplate lui-meme :

> Ce projet est encore configure en tant que boilerplate. Lance `pnpm init-project` pour l'initialiser.

## Renvois

Regles detaillees dans les fichiers locaux :

- `src/lib/AGENT.md` — Infra, DB, Auth, Logging
- `src/lib/db/AGENT.md` — Base de donnees, Drizzle, Migrations
- `src/lib/validations/AGENT.md` — Validations Zod partagees
- `src/features/AGENT.md` — Data Flow, Caching, Tests
- `src/app/AGENT.md` — Routage, Proxy, PPR, CSP
- `src/styles/AGENT.md` — Tailwind v4, Design System, Themes
- `src/components/AGENT.md` — Composants UI, Layout
- `tests/AGENT.md` — Tests, Vitest, Mocking
- `scripts/AGENT.md` — Scripts Node, Seed, Environnement

En cas de conflit, la regle locale prevaut sur ce fichier.
