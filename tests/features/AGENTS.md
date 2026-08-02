# Tests de features (`tests/features/`)

## Contrat

- Tests organisés par domaine métier.
- Les services se testent avec repositories mockés.
- Les repositories unitaires mockent `@/lib/db`; les intégrations DB utilisent une base dédiée, jamais la DB partagée local/prod.

## Anti-contournement

- Ne jamais faire passer un test en codant une valeur spéciale dans l'implémentation.
- Les fixtures doivent représenter un scénario métier lisible et rester fictives.
