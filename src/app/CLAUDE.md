# app/

## Auth & Protection des routes

- `proxy.ts` vérifie le cookie uniquement (pas de validation DB) — perf intentionnelle
- **Toute page/action protégée doit appeler `requireSession()`** depuis `lib/auth/server.ts`
- Ne jamais se fier au proxy seul pour contrôler l'accès aux données
- Ajouter les routes protégées dans `protectedRoutes` de `src/proxy.ts`

## PPR / Suspense

`cacheComponents: true` actif. Ajouter `<Suspense fallback={<Skeleton />}>` autour des composants async par feature. `loading.tsx` par segment comme point de départ.

## CSP / Nonce

`next.config.ts` a `'unsafe-inline'` — protection XSS désactivée. Implémenter un nonce par requête dans `proxy.ts` avant première mise en production.
