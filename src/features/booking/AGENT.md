# Feature Booking (`src/features/booking/`)

## Contrat

- Domaine rendez-vous/réservations uniquement.
- Toute évolution passe par `schema.ts`, puis `pnpm db:generate` et `pnpm db:migrate`.
- Ajouter `actions.ts`, `service.ts`, `repository.ts`, `types.ts` dès que la feature dépasse le schéma.

## Anti-contournement

- Ne pas stocker des réservations dans un modèle générique pour éviter une migration.
- Ne pas hardcoder de créneaux, statuts ou règles de disponibilité client dans le schéma.
