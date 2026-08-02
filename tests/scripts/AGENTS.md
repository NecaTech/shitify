# Script Tests (`tests/scripts/`)

## Purpose

Tests des scripts Node purs et de leurs garde-fous opérationnels. Les scripts
sources restent sous `scripts/` et leur contrat local est `scripts/AGENTS.md`.

## Boundaries

- Exécuter les scripts via `pnpm exec tsx` ou un processus Node isolé.
- Fournir explicitement un environnement fictif dans le test.
- Ne jamais dépendre de `.env.local`, de Vercel réel, d'une DB réelle ou du réseau.
- Vérifier les sorties et codes de retour observables, pas les fonctions privées.

## Safe Edit Surface

Agents may safely:

- ajouter des tests de refus pour opérations dangereuses;
- ajouter des tests de confirmation explicite;
- ajouter des fixtures d'env fictives `example_*`.

Agents must not:

- lancer une opération destructive;
- passer un secret ou une URL client réelle;
- mocker le garde-fou au point de ne plus tester le script exécuté.

## Verification

```bash
pnpm exec vitest run tests/scripts
pnpm test
```
