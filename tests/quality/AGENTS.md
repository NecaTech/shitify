# Suite Quality Tests (`tests/quality/`)

## Purpose

Tests méta qui protègent la qualité de la suite elle-même. Ce dossier vérifie
les règles transverses qui doivent rester vraies pour tout projet issu du
boilerplate.

## Boundaries

- Tester uniquement des propriétés de la suite, des fichiers ou de la
  gouvernance de tests.
- Ne pas importer de code applicatif métier.
- Ne pas dupliquer les checks statiques déjà couverts par `scripts/readiness.ts`
  sauf si le test apporte un signal plus rapide ou plus clair.

## Safe Edit Surface

Agents may safely:

- ajouter un test méta qui détecte une dérive fréquente et générique;
- vérifier des patterns de fichiers de tests;
- renforcer la discipline `.only`, `.skip`, fixtures et données fictives.

Agents must not:

- ajouter des règles spécifiques à un client;
- transformer ce dossier en linter généraliste concurrent de `readiness`;
- bloquer un pattern utile sans règle documentée dans `tests/AGENTS.md`.

## Verification

```bash
pnpm exec vitest run tests/quality
pnpm test
```
