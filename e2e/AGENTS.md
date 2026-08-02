# Tests E2E (`e2e/`)

## Purpose

Tests Playwright des parcours critiques exécutés contre l'application complète.
Le contrat d'exécution est défini par `playwright.config.ts`.

## Boundaries

- Couvrir des comportements accessibles à un utilisateur : navigation, rendu,
  redirections et parcours critiques.
- Utiliser le serveur local lancé par Playwright, ou une valeur explicite de
  `E2E_BASE_URL` pour une cible déjà disponible.
- Ne jamais utiliser une base de données, un compte, une URL ou un secret de
  production, staging ou client.
- Ne pas tester les détails internes déjà couverts par Vitest.

## Verification

```bash
pnpm test:e2e
```
