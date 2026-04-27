# CLAUDE.md — NecaTech Boilerplate

## Session Startup — Boilerplate Detection

**Au démarrage de chaque session**, vérifie si ce projet est encore un boilerplate non initialisé :

- `git remote get-url origin` contient encore `necatech-boilerplate`, ou
- `git remote` retourne vide.

Si l'une de ces conditions est vraie **et que la demande ne concerne pas le boilerplate lui-même** :

> Ce projet est encore configuré en tant que boilerplate. Lance `/new-project` pour l'initialiser.

Ne continue pas tant que l'utilisateur n'a pas confirmé ou explicitement ignoré.

---

## Stack

Next.js 16 (App Router) · TypeScript 5 strict · Tailwind CSS 4 · Drizzle ORM · Better Auth 1.x · Zod 4 · PostgreSQL via Neon (`@neondatabase/serverless`) · Vercel (Fluid Compute, pas Edge Functions) · pnpm

---

## Data Flow

```
page.tsx → actions.ts → service.ts → repository.ts → lib/db
```

Référence complète : `src/features/auth/`

Règles détaillées par couche dans les `CLAUDE.md` des sous-dossiers :

- `src/features/` — data flow, caching, tests
- `src/lib/` — env vars, DB, logging
- `src/components/` — styling, domain-agnostic
- `src/app/` — auth, PPR, CSP

---

## TypeScript

- Strict mode — pas de `any`, pas de `as unknown as X` sans commentaire
- Server Actions : toujours un type de retour explicite
- `type` pour les data shapes, `interface` seulement si extension intentionnelle
