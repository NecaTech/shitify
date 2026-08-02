# Feature Notifications (`src/features/notifications/`)

## Contrat

- Domaine notifications utilisateur uniquement.
- Les canaux réels (email, push, SMS) doivent avoir une intégration dédiée et configurable.
- Les statuts de lecture/livraison doivent rester explicites.

## Anti-contournement

- Ne jamais hardcoder un provider, webhook, destinataire ou template client.
- Ne pas utiliser les notifications comme journal d'audit durable.
