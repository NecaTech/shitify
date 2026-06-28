# Tests

## Purpose

Tests Vitest, Testing Library et setup global. Les tests E2E Playwright vivent
dans `e2e/`. Ce dossier porte aussi le socle minimum réutilisable du
boilerplate.

## Safe Edit Surface

Agents may safely:

- add behavior tests under `tests/features/<feature>/`;
- add reusable hook behavior tests under `tests/hooks/`;
- add script guard tests under `tests/scripts/`;
- add suite-quality tests under `tests/quality/`;
- add fictive fixtures/factories when they clarify behavior.

Agents must not:

- copy client-specific domain tests into the boilerplate;
- use real client data, production URLs, secrets, or provider ids;
- weaken assertions to hide regressions;
- commit `.only` or `.skip` as a shortcut.

## Must

- Tester le comportement, pas les détails privés d'implémentation.
- Garder les tests proches de la couche concernée.
- Actions : tester validation Zod, `ActionResult<T>`, erreurs retournées et ordre
  validation/session quand le contrat l'exige.
- Services : mock strict des repositories avec `vi.mock`.
- Repositories unitaires : mock de `@/lib/db`.
- Scripts : exécuter le script via un processus isolé avec env fictif explicite.
- Composants : queries accessibles (`getByRole`, `getByLabelText`, `getByText`).
- Hooks : tester l'état observable, les callbacks publics et les fakes navigateur,
  jamais les détails internes.
- Médias : quand un composant affiche une URL same-origin, signée ou servie par
  route applicative, ajouter un test DOM qui vérifie que l'URL rendue reste
  celle fournie par l'appelant.
- Proxy : tester routes protégées, routes auth, cas avec/sans cookie et anti-boucle.
- E2E : couvrir les workflows critiques sans dépendre d'une DB prod, staging ou partagée.

## Machine-Enforced Rules

- `pnpm test` exécute le socle Vitest.
- `tests/quality/test-discipline.test.ts` refuse les tests focalisés `.only` et
  les tests ignorés `.skip`.
- `tests/quality/ui-media-url-boundary.test.ts` protège les primitives UI contre
  la réécriture implicite des URLs média fournies par l'appelant.
- `tests/hooks/use-upload-batch.test.tsx` garantit les uploads par lot avec état
  par fichier, retry des échecs uniquement et limite de concurrence.
- `tests/scripts/assert-safe-db-env.test.ts` verrouille les garde-fous DB/env.

## Not Enforced Yet

- Obligation automatique de créer un test de non-régression pour chaque bugfix.
- Détection automatique des données client réelles dans les fixtures.

## Patterns

- Fixtures/factories fictives et lisibles comme scénarios métier.
- Un test doit être compréhensible sans ouvrir l'implémentation.
- Ne pas tester les classes Tailwind sauf variants critiques.
- Quand un apprentissage vient d'un projet client, remonter la règle abstraite,
  pas le nom de feature, statut, route ou champ propriétaire.

## Checks

- `pnpm test`
- `pnpm typecheck` quand des tests TypeScript sont ajoutés ou modifiés.
- `pnpm lint` quand les mocks/imports changent.
- `pnpm test:e2e` pour les smoke tests runtime avant livraison.
- `pnpm test:coverage` quand le changement touche une surface partagée.
