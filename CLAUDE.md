# CLAUDE.md — NecaTech Boilerplate

## Detection Boilerplate

Si `git remote get-url origin` contient `necatech-boilerplate` ou que `git remote` est vide, et que la demande ne concerne pas le boilerplate lui-meme :

> Ce projet est encore configure en tant que boilerplate. Lance `/new-project` pour l'initialiser.

## Renvois

Regles detaillees dans les fichiers locaux :

- `src/lib/CLAUDE.md` — Infra, DB, Auth, Logging
- `src/features/CLAUDE.md` — Data Flow, Caching, Tests
- `src/app/CLAUDE.md` — Routage, Proxy, PPR, CSP
- `src/styles/CLAUDE.md` — Tailwind v4, Design System, Themes
- `src/components/CLAUDE.md` — Composants UI, Layout

En cas de conflit, la regle locale prevaut sur ce fichier.
