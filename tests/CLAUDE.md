# Tests (`tests/`)

## Stack

- Vitest pour les tests.
- Testing Library pour les composants React.
- `tests/setup.ts` pour la configuration globale.

## Règles générales

- Tester le comportement, jamais l'implémentation interne.
- Écrire les tests avant l'implémentation pour toute logique métier non triviale.
- Nommer les fichiers de test en `<nom>.test.ts` ou `<nom>.test.tsx`.
- Garder les tests proches du domaine testé dans `tests/features/<feature>/`.
- Garder les tests UI partagés dans `tests/components/ui/`.
- Un test doit être lisible sans ouvrir l'implémentation.

## Services

- Tester les services en isolant les repositories.
- Mock strict des repositories avec `vi.mock`.
- Vérifier les cas nominaux et les cas d'erreur métier.
- Vérifier les `throw` attendus quand une entité requise est absente.
- Ne jamais mocker le service testé.

## Repositories

- Les tests unitaires de repositories mockent `@/lib/db`.
- Les tests d'intégration utilisent une vraie base dédiée.
- Ne jamais exécuter de test repository contre une base de production.
- Vérifier les retours `T | null`.
- Ne pas transformer un `null` repository en erreur dans le test repository.

## Actions

- Tester les Server Actions comme des boundaries.
- Vérifier la validation Zod.
- Vérifier le format `ActionResult<T>`.
- Vérifier les erreurs retournées, pas les erreurs internes.
- Mock des services, de `logger`, de `next/cache` et de `server-only`.
- Ne jamais appeler la base de données depuis un test d'action.

## Composants

- Tester uniquement le comportement visible.
- Utiliser Testing Library.
- Ne pas tester les classes Tailwind sauf pour les variants critiques.
- Ne pas tester la structure DOM interne si elle n'a pas de valeur métier.
- Préférer les queries accessibles (`getByRole`, `getByLabelText`, `getByText`).

## Proxy

- Tester les redirections.
- Tester les routes protégées.
- Tester les routes auth.
- Tester les cas avec et sans cookie.
- Tester le contrat anti-boucle avec le paramètre `redirect`.

## Interdictions

- Ne jamais écrire de tests dépendants de l'ordre d'exécution.
- Ne jamais tester des détails privés d'implémentation.
- Ne jamais utiliser de données réelles client.
- Ne jamais dépendre d'une base distante non dédiée.
- Ne jamais ignorer un test cassé avec `.skip` sans justification explicite.
