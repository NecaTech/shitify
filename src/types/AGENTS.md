# Types partagés (`src/types/`)

## Contrat

- Types transverses sans dépendance runtime.
- Aucun import depuis `src/features`, `src/app`, `src/lib/db` ou des modules serveur.
- Les types métier spécifiques restent dans `features/<feature>/types.ts`.

## Anti-contournement

- Ne jamais utiliser `any` ou un type trop large pour contourner Zod, Drizzle ou TypeScript.
- Ne jamais déplacer un type métier ici uniquement pour casser une dépendance circulaire ; corriger la frontière de module.
