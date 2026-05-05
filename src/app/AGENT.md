# Scope

App Router Next.js : routing, layouts, pages, loading/error boundaries, API route
handlers. Hérite des règles globales du root `AGENT.md`.

# Must

- Garder `src/app` comme couche de composition et navigation.
- Une `page.tsx` Server Component peut appeler un `service.ts` pour lire.
- Les mutations passent par des Server Actions de feature.
- Toute route protégée utilise `requireSession()` côté serveur.
- Toute nouvelle route protégée est déclarée dans `protectedRoutes` et `config.matcher` de `src/proxy.ts`.
- Le proxy conserve le contrat anti-boucle : `redirect` sur login et header `x-current-path`.

# Must not

- Ne jamais importer `repository.ts`, `db` ou Drizzle depuis `src/app`.
- Ne jamais mettre de logique métier durable dans une page ou un layout.
- Ne jamais faire confiance au proxy seul pour l'autorisation de données.
- Ne jamais rediriger vers une URL externe fournie par l'utilisateur.

# Patterns

- `loading.tsx` par segment pour le chargement initial.
- `error.tsx` pour isoler les erreurs par segment.
- Données async sous `<Suspense>` quand la page compose plusieurs blocs.
- CSP actuelle adaptée au pilot/staging ; durcir avant production client.

# Checks

- `pnpm test` maintient les routes protégées et le contrat proxy.
- `pnpm readiness` vérifie le matcher et les warnings de durcissement.
