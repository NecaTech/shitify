# Scope

Tests Vitest, Testing Library et setup global. Hérite des règles globales du root
`AGENT.md`.

# Must

- Tester le comportement, pas les détails privés d'implémentation.
- Garder les tests proches du domaine dans `tests/features/<feature>/`.
- Services : mock strict des repositories avec `vi.mock`.
- Repositories unitaires : mock de `@/lib/db`.
- Actions : tester validation Zod, `ActionResult<T>`, erreurs retournées.
- Composants : queries accessibles (`getByRole`, `getByLabelText`, `getByText`).
- Proxy : tester routes protégées, routes auth, cas avec/sans cookie et anti-boucle.

# Must not

- Ne jamais dépendre d'une DB production, staging ou DB partagée pilot/staging.
- Ne jamais utiliser de données client réelles.
- Ne jamais faire passer un test en codant une valeur spéciale dans l'implémentation.
- Ne jamais ignorer un test cassé avec `.skip` sans justification explicite.
- Ne jamais modifier une assertion pour cacher une régression sans expliquer le changement de contrat.

# Patterns

- Fixtures/factories fictives et lisibles comme scénarios métier.
- Un test doit être compréhensible sans ouvrir l'implémentation.
- Ne pas tester les classes Tailwind sauf variants critiques.

# Checks

- `pnpm test`
- `pnpm test:coverage` quand le changement touche une surface partagée.
