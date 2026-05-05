# Tests Auth (`tests/features/auth/`)

## Contrat

- Couvrir les règles du service auth sans dépendre de Better Auth réel.
- Mocker le repository strictement.
- Vérifier les erreurs métier attendues quand un utilisateur est absent.

## Anti-contournement

- Ne jamais hardcoder un user id ou email dans le service pour satisfaire ces tests.
- Si le contrat change, mettre à jour le test et la règle de feature ensemble.
