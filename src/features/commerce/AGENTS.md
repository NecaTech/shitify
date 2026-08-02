# Feature Commerce (`src/features/commerce/`)

## Contrat

- Domaine produits, commandes et lignes de commande uniquement.
- Les prix, devises, taxes et statuts doivent être modélisés explicitement.
- Toute évolution persistée passe par migration Drizzle.

## Anti-contournement

- Ne jamais hardcoder un prix, une devise, une remise ou un statut de commande pour corriger une démo.
- Ne pas mélanger facturation réelle, paiement et catalogue sans modèle dédié.
