# Feature Contact (`src/features/contact/`)

## Contrat

- Domaine formulaires de contact, leads et messages entrants.
- Les champs sensibles ou consentements doivent être modélisés explicitement.
- Ajouter une couche service/action avant toute soumission réelle depuis une UI.

## Anti-contournement

- Ne jamais envoyer ou stocker une donnée client réelle dans un placeholder.
- Ne jamais hardcoder une adresse destinataire ou webhook dans le code ; utiliser env/config.
