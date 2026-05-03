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

## Contrat d'erreurs inter-couches

- **`repository.ts` → `service.ts` :** Les repositories retournent toujours `T | null`. Ils ne throw jamais. Un résultat vide est `null`, une erreur Drizzle inattendue se propage naturellement.
- **`service.ts` → `actions.ts` :** Les services throw une `Error` si un `null` retourné par le repository est inattendu (ex: entité introuvable lors d'une mise à jour). Ils ne retournent pas de type Result.
- **`actions.ts` :** Enveloppe les appels service dans un `try/catch` et traduit les erreurs en `{ success: false, error: string }`. C'est la seule couche qui produit un `ActionResult<T>`.
- **`schema.ts`** : Définition des tables Drizzle.
- **Sécurité :** Directive `'server-only'` OBLIGATOIRE sur `repository.ts`, `service.ts`, et `schema.ts`.

## Caching (Next.js 16)

- **Directive :** `'use cache'` obligatoire sur toutes les fonctions de lecture (`read`) du repository.
- **Tags :**
  - Granulaires : ``cacheTag(`entity:${id}`)``
  - Génériques : `cacheTag('entity')`
- **Mutations :** Après chaque action, déclencher `revalidateTag('entity', 'max')` (stale-while-revalidate recommandé par Next.js 16).

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
3. Générer la migration : `pnpm db:generate` puis `pnpm db:migrate`.

## Patterns à configurer par projet (TODO init-project)

- **`cacheLife`** dans les `repository.ts` — la valeur `"hours"` du boilerplate est un défaut raisonnable. Ajuster selon la fréquence de mutation des données de la feature (ex. `"minutes"` pour des données temps-réel, `"days"` pour des données statiques).
- **`cacheTag` granulaire** — le pattern `entity:${id}` est la référence. Ajouter des tags collectifs `cacheTag("entity")` si des listes doivent être invalidées en bloc.
- **`revalidateTag` après mutation** — toujours appeler `revalidateTag(entityTag(id), "max")` dans `actions.ts` après chaque écriture.

## Testing

- **Unitaire :** Mocking strict de `@/lib/db` avec `vi.mock`.
- **Intégration :** Utilisation d'une instance réelle de base de données.
- **Fichiers :** Nommage en `<nom>.test.ts` (ex: `repository.test.ts`, `service.test.ts`).
