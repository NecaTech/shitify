# Feature Creation (`src/features/creation/`)

## Rôle

Fige le **format** canonique d'une création Shitify : idée + prototype + pitch +
métriques vanity (docs/product.md §14 — V0, issue #12). C'est la référence
contre laquelle toute génération future (V1) sera jugée.

## Périmètre V0

- `types.ts` — la forme d'une création (aucune persistance, aucun moteur).
- `pitch.ts` — générateur pur de pitch/métriques, dérivé de l'idée.
- `invariants.ts` — garde-fous de forme et de ton (vérité à zéro, métrique
  dérivée, aucune vulgarité ni « shit »).
- `vocabulary.ts` — vocabulaire verrouillé et frontière « shit ».
- `components/` — surfaces d'affichage (chrome FR, performance EN).

Aucun `service.ts`/`repository.ts`/`schema.ts` : V0 est un artefact de format,
pas une feature persistée. Le contenu de dogfood (« transport pour oiseaux »)
vit hors de cette feature, dans une route jetable ; il ne constitue pas une
fonctionnalité expédiée.

## Périmètre V1a (boucle one-shot, issue #13)

- `generator.ts` — interprète un prompt libre en `Idea` (lexique de gabarits de
  domaines + repli heuristique), puis compose la `Creation` (pitch + prototype +
  métriques) via des fonctions pures. Gabarits + données fictives déterministes,
  aucun moteur LLM.
- `components/PrototypeCanvas.tsx` — prototype interactif générique (« démo
  live »), paramétré par le domaine de l'idée (voix performance).
- `components/CreationWorkspace.tsx` — les deux postures « Itérer » (canvas +
  conversation) et « Consulter » (prototype seul plein écran). Conversation en
  langage naturel uniquement : jamais d'IDE, d'arborescence ni d'édition de code.

V1a reste local-first : génération locale, pas de `service.ts`/`repository.ts`/
`actions.ts` tant qu'auth et DB ne sont pas décidées (docs/product.md §14 — V1).

## Frontière

- La copie de performance (pitch) est EN ; le chrome est FR. Ne pas mélanger.
- La copie du pitch ne contient jamais de vulgarité ni le mot « shit » — seuls
  les noms de marque (Shitify, `Burn my tokens`, `My Bullshits`) le portent.
- Ne pas coder en dur une métrique d'une création particulière dans le
  générateur : les métriques dérivent de l'idée d'entrée.
