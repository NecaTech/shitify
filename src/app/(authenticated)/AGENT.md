# Routes protégées (`src/app/(authenticated)/`)

## Contrat

- Toutes les routes de ce groupe exigent une session valide.
- Le layout appelle `requireSession()` pour protéger le groupe.
- Une page enfant peut rappeler `requireSession()` pour récupérer la session courante.
- Toute nouvelle route protégée doit être ajoutée dans `protectedRoutes` et `config.matcher` de `src/proxy.ts`.

## Frontière

- Les pages peuvent appeler des `service.ts` pour composer des lectures serveur.
- Les pages ne doivent jamais importer `repository.ts`, `db`, Drizzle, ou une logique métier durable.
- Les mutations passent par des Server Actions de feature.

## Anti-contournement

- Ne jamais exposer temporairement une route protégée en dehors de ce groupe pour éviter l'auth.
- Ne jamais hardcoder un user id, rôle ou email pour contourner `requireSession()`.
- Si une redirection boucle, corriger le contrat `proxy.ts` / `requireSession()` au lieu de désactiver la protection.
