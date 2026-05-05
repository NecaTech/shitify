# Routage et Layer applicatif

## Philosophie du dossier `app/`

- **Routage uniquement :** Ce dossier contient exclusivement la structure de navigation (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- **Interdiction formelle :** Aucune logique métier, aucun appel direct à la base de données, aucun repository.
- **Lectures serveur :** Une `page.tsx` Server Component peut appeler un `service.ts` pour composer des données de lecture. Les mutations passent par des Server Actions.

## Sécurité et Protection des routes

- **Proxy (Border Gateway) :** `proxy.ts` est utilisé uniquement comme un filtre réseau (cookies/headers).
- **Contrôle d'accès :** La vérification de session est OBLIGATOIRE via `requireSession()` (importe depuis `lib/auth/server.ts`) dans chaque page ou Server Action protégée. Ne jamais faire confiance au proxy seul pour l'autorisation de données.
- **Maintenance :** Toute nouvelle route protégée doit être déclarée dans `protectedRoutes` au sein de `src/proxy.ts`.

## Performance et Streaming (Next.js 16)

- **PPR (Partial Prerendering) :** `cacheComponents: true` est actif.
- **Suspense :** Toute donnée asynchrone doit être enveloppée dans un `<Suspense fallback={<... />}>`.
- **Loading UI :** Utiliser `loading.tsx` par segment de route pour définir le point de chargement initial.

## Sécurité Avancée

- **Nonce (TODO init-project) :** La configuration actuelle utilise `'unsafe-inline'` par défaut. Toute mise en production réelle exige l'implémentation d'un nonce dynamique généré dans `proxy.ts` par requête et injecté dans `<script>` via `headers()`. Remplacer `'unsafe-inline'` par `'nonce-${nonce}'` dans la CSP de `next.config.ts`.
- **`connect-src 'self'` (TODO init-project) :** Élargir avec les domaines réels du projet dans `next.config.ts` : Neon (`*.neon.tech`), analytics, CDN d'images, etc.
- **`protectedRoutes` (TODO init-project) :** Déclarer chaque nouvelle route protégée dans `proxy.ts` ET dans le tableau `matcher` — les deux doivent rester synchronisés.
- **Erreurs :** Utiliser `error.tsx` pour isoler les boundaries d'erreurs et éviter les crashs de l'application entière.
