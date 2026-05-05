# Architecture des Features (NecaTech)

## Flux de données (Data Flow)

Le flux est impératif et unidirectionnel :

- Mutations et soumissions client : `UI (Client Components) → actions.ts → service.ts → repository.ts → lib/db`
- Lectures depuis une Server Component route (`page.tsx`) : `page.tsx → service.ts → repository.ts → lib/db`

- **Interdiction absolue :** Ne jamais sauter de couche (ex: `page.tsx` → `repository.ts`, `actions.ts` → `db`, ou composant React → `repository.ts` sont prohibés).
- **Isolation :** Les composants UI spécifiques à la feature restent dans `features/<feature>/components/`.
- **Anti-hardcoding :** Ne jamais coder en dur une donnée métier, un id, un rôle, une adresse email, une valeur de statut ou un résultat attendu pour contourner une règle de couche, un test ou une erreur DB. Ces valeurs doivent venir des inputs validés, de la session, de la DB, d'une config de feature ou d'une factory de test.

## Responsabilités des couches

- **`actions.ts`** : Point d'entrée serveur pour les mutations et les formulaires. Valide impérativement avec Zod, vérifie la session, appelle le service, retourne `ActionResult<T>`. Toujours `"use server"`.
- **`service.ts`** : Orchestration métier pure. Aucune interaction directe avec la DB.
- **`repository.ts`** : Couche d'accès aux données. Drizzle uniquement. Aucune décision métier. Les conditions techniques de mapping (`row ?? null`, absence de ligne, assemblage simple de relations) sont autorisées.
- **Configuration métier :** Les valeurs par défaut visibles par l'utilisateur peuvent vivre dans un fichier `config.ts` de feature si elles sont assumées comme configuration produit, pas comme correction cachée.

## Diagnostic et qualité d'architecture

- Corriger un bug de feature dans la couche qui en est responsable : validation dans `actions.ts`, règle métier dans `service.ts`, requête dans `repository.ts`, structure persistée dans `schema.ts`.
- Ne pas déplacer une règle métier dans `actions.ts` ou `repository.ts` pour résoudre vite une erreur.
- Ne pas dupliquer une règle métier entre client, action et service. Le client peut améliorer l'UX, mais le service reste la source de vérité métier.
- Si un test échoue, corriger le comportement ou le test selon le contrat documenté. Ne jamais adapter le code à une donnée de test codée en dur.

## Contrat d'erreurs inter-couches

- **`repository.ts` → `service.ts` :** Les repositories retournent toujours `T | null`. Ils ne throw jamais. Un résultat vide est `null`, une erreur Drizzle inattendue se propage naturellement.
- **`service.ts` → `actions.ts` :** Les services throw une `Error` si un `null` retourné par le repository est inattendu (ex: entité introuvable lors d'une mise à jour). Ils ne retournent pas de type Result.
- **`actions.ts` :** Enveloppe les appels service dans un `try/catch` et traduit les erreurs en `{ success: false, error: string }`. C'est la seule couche qui produit un `ActionResult<T>`.
- **`schema.ts`** : Définition des tables Drizzle.
- **Sécurité :** Directive `'server-only'` OBLIGATOIRE sur `repository.ts` et `service.ts`. Les `schema.ts` restent importables par Drizzle Kit pour générer les migrations.

## Contrat proxy / requireSession (anti-boucle)

Le proxy (`src/proxy.ts`) et `requireSession()` (`src/lib/auth/server.ts`) doivent coopérer pour éviter une boucle de redirection fatale.

**Scénario de boucle :**

1. Cookie de session présent mais invalide (expiré, DB injoignable...)
2. Proxy sur une route protégée → cookie OK → laisse passer
3. `requireSession()` → `auth.api.getSession()` échoue → `redirect("/login")`
4. Proxy sur `/login` → cookie présent → `redirect("/dashboard")`
5. Retour à 2 → boucle infinie

**Correctif obligatoire en deux points :**

1. **`proxy.ts`** : ne pas rediriger depuis `/login` si un paramètre `redirect` est présent (le user a été explicitement envoyé là par `requireSession`) :

```ts
if (isAuthRoute && session && !request.nextUrl.searchParams.has("redirect")) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

2. **`server.ts`** : `requireSession()` doit passer le pathname courant dans la redirection pour que le proxy puisse distinguer une venue légitime d'un rebond :

```ts
export async function requireSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    const pathname = headersList.get("x-current-path") ?? "/";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }
  return session;
}
```

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
- `schema.ts` — Tables Drizzle importables par Drizzle Kit.
- `types.ts` — Types partages (DTOs, entrees/sorties).
- `components/` — Composants UI specifiques a la feature.

## Nommage durable

- Nommer la feature par le domaine réel : `booking`, `commerce`, `contact`, `workspace`.
- Nommer les tables SQL en singulier `snake_case`.
- Utiliser `resource` uniquement pour le CRUD configurable post-déploiement.
- Ne pas introduire de préfixes faibles (`custom`, `generic`, `dynamic`, `data`) : ils cachent l'intention et rendent les migrations douloureuses.
- Si le domaine n'est pas encore stable, utiliser `resource` / `resource_field` / `resource_record` jusqu'à figer une vraie feature typée.

## Workflow d'ajout de feature

1. Copier le squelette depuis `features/auth/`.
2. Déclarer les nouveaux schémas dans `lib/db/schema.ts` : `export * from "@/features/<nom>/schema"`.
3. Générer la migration : `pnpm db:generate` puis `pnpm db:migrate`.

## Workflow d'évolution de schéma

1. Modifier le `schema.ts` local de la feature.
2. Mettre à jour `types.ts`, `repository.ts`, `service.ts`, `actions.ts` dans cet ordre.
3. Générer une migration avec `pnpm db:generate`.
4. Relire le SQL généré : noms, contraintes, indexes, `onDelete`.
5. Lancer `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm readiness`.
6. Pour une base déjà déployée, appliquer uniquement avec `pnpm db:migrate`.

Ne jamais corriger une évolution de schéma en modifiant directement une migration déjà appliquée en production.

## Patterns à configurer par projet (TODO init-project)

- **`cacheLife`** dans les `repository.ts` — la valeur `"hours"` du boilerplate est un défaut raisonnable. Ajuster selon la fréquence de mutation des données de la feature (ex. `"minutes"` pour des données temps-réel, `"days"` pour des données statiques).
- **`cacheTag` granulaire** — le pattern `entity:${id}` est la référence. Ajouter des tags collectifs `cacheTag("entity")` si des listes doivent être invalidées en bloc.
- **`revalidateTag` après mutation** — toujours appeler `revalidateTag(entityTag(id), "max")` dans `actions.ts` après chaque écriture.

## Testing

- **Unitaire :** Mocking strict de `@/lib/db` avec `vi.mock`.
- **Intégration :** Utilisation d'une instance réelle de base de données.
- **Fichiers :** Nommage en `<nom>.test.ts` (ex: `repository.test.ts`, `service.test.ts`).
