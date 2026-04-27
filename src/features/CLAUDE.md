# Features

## Structure

Chaque feature suit le data flow : `actions.ts → service.ts → repository.ts → lib/db`

- `actions.ts` — valide avec Zod, appelle le service, retourne `ActionResult<T>`. Toujours `"use server"`.
- `service.ts` — orchestration métier, jamais de DB directe
- `repository.ts` — Drizzle uniquement, pas de if/else métier

`server-only` obligatoire dans : `repository.ts`, `service.ts`, `schema.ts`

## Règles

- Jamais sauter une couche (`page.tsx` → `repository.ts` interdit)
- Nouvelle feature : copier `features/auth/`, puis `export * from "@/features/<nom>/schema"` dans `lib/db/schema.ts`
- Composants spécifiques à une feature → `features/<feature>/components/` (pas dans `components/ui/`)

## Caching (Next 16)

- `'use cache'` sur les fonctions read de `repository.ts`
- Tags granulaires : ``cacheTag(`user:${id}`)`` ; broad : `cacheTag('users')`
- Import : `import { unstable_cacheTag as cacheTag } from "next/cache"`

```ts
export async function findUserById(id: string): Promise<User | null> {
  "use cache";
  cacheTag(`user:${id}`);
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return row ?? null;
}
```

Après mutation dans `actions.ts` : `revalidateTag('entity', 'default')` — le 2e argument `'default'` est requis en Next 16.

## Tests

Modèle : `repository.test.ts`, `service.test.ts`. Mock `@/lib/db` avec `vi.mock` en unit ; vraie DB en intégration.
