# Routage et Layer applicatif

## Philosophie du dossier `app/`
- **Routage uniquement :** Ce dossier contient exclusivement la structure de navigation (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- **Interdiction formelle :** Aucune logique métier, aucun appel direct à la base de données, aucun repository.

## Sécurité et Protection des routes
- **Proxy (Border Gateway) :** `proxy.ts` est utilisé uniquement comme un filtre réseau (cookies/headers).
- **Contrôle d'accès :** La vérification de session est OBLIGATOIRE via `requireSession()` dans chaque page ou Server Action protégée. Ne jamais faire confiance au proxy seul pour l'autorisation de données.
- **Maintenance :** Toute nouvelle route protégée doit être déclarée dans `protectedRoutes` au sein de `src/proxy.ts`.

## Performance et Streaming (Next.js 16)
- **PPR (Partial Prerendering) :** `cacheComponents: true` est actif.
- **Suspense :** Toute donnée asynchrone doit être enveloppée dans un `<Suspense fallback={<... />}>`.
- **Loading UI :** Utiliser `loading.tsx` par segment de route pour définir le point de chargement initial.

## Sécurité Avancée
- **Nonce (TODO) :** La configuration actuelle utilise `'unsafe-inline'` par défaut. Toute mise en production réelle exige l'implémentation d'un nonce dynamique généré via `proxy.ts` par requête.
- **Erreurs :** Utiliser `error.tsx` pour isoler les boundaries d'erreurs et éviter les crashs de l'application entière.