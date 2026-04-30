# Architecture des Features (NecaTech)

## Flux de données (Data Flow)

Le flux est impératif et unidirectionnel :
`UI (Client Components) → actions.ts → service.ts → repository.ts → lib/db`

- **Interdiction absolue :** Ne jamais sauter de couche (ex: `page.tsx` → `repository.ts` est prohibé).
- **Isolation :** Les composants UI spécifiques à la feature restent dans `features/<feature>/components/`.

## Responsabilités des couches

- **`actions.ts`** : Point d'entrée serveur. Valide impérativement avec Zod, vérifie la session, appelle le service, retourne `ActionResult<T>`. Toujours `"use server"`.
- **`service.ts`** : Orchestration métier pure. Aucune interaction directe avec la DB.
- **`repository.ts`** : Couche d'accès aux données. Drizzle uniquement. Aucune logique métier (if/else conditionnels).
- **`schema.ts`** : Définition des tables Drizzle.
- **Sécurité :** Directive `'server-only'` OBLIGATOIRE sur `repository.ts`, `service.ts`, et `schema.ts`.

## Caching (Next.js 16)

- **Directive :** `'use cache'` obligatoire sur toutes les fonctions de lecture (`read`) du repository.
- **Tags :**
  - Granulaires : ``cacheTag(`entity:${id}`)``
  - Génériques : `cacheTag('entity')`
- **Mutations :** Après chaque action, déclencher `revalidateTag('entity', 'default')` (le paramètre `'default'` est requis).

## Structure d'une feature

Fichiers obligatoires :

- `actions.ts` — Server Actions, validation Zod, appel au service. Toujours `"use server"`.
- `service.ts` — Orchestration metier pure. `'server-only'`.
- `repository.ts` — Acces Drizzle. `'server-only'`.
- `schema.ts` — Tables Drizzle. `'server-only'`.
- `types.ts` — Types partages (DTOs, entrees/sorties).
- `components/` — Composants UI specifiques a la feature.

## Workflow d'ajout de feature

1. Copier le squelette depuis `features/auth/`.
2. Déclarer les nouveaux schémas dans `lib/db/schema.ts` : `export * from "@/features/<nom>/schema"`.

## Testing

- **Unitaire :** Mocking strict de `@/lib/db` avec `vi.mock`.
- **Intégration :** Utilisation d'une instance réelle de base de données.
- **Fichiers :** Nommage en `<nom>.test.ts` (ex: `repository.test.ts`, `service.test.ts`).
