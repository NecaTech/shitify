# Tests Auth (`tests/features/auth/`)

## Purpose

Contrats de la feature auth côté services et actions serveur, sans dépendre de
Better Auth réel.

## Safe Edit Surface

Agents may safely:

- mocker `@/features/auth/repository`, `@/features/auth/service`,
  `@/lib/auth/server`, `next/cache` et `server-only`;
- ajouter des tests de validation/action autour de `ActionResult<T>`;
- ajouter des fixtures fictives Better Auth complètes quand les types l'exigent.

Agents must not:

- utiliser Better Auth réel, une DB réelle ou une session réelle;
- hardcoder un user id/email dans l'implémentation pour satisfaire un test;
- faire dépendre les tests auth d'un ordre interne hors contrat observable.

## Contract

- Couvrir les règles du service auth avec repository mocké strictement.
- Couvrir les actions auth avec validation Zod, session requise, erreur retournée
  et revalidation cache observable.
- Vérifier les erreurs métier attendues quand un utilisateur est absent.
- Si le contrat change, mettre à jour le test et la règle de feature ensemble.

## Verification

```bash
pnpm exec vitest run tests/features/auth
pnpm test
```
