# Scope

Scripts Node purs hors runtime Next.js :

- `init-project.ts` : initialisation post-clonage du template.
- `vercel-bootstrap.ts` : liaison Vercel, env vars, déploiement reproductible.
- `readiness.ts` : checks statiques et readiness.
- `seed.ts` : seed fictif projet.

Hérite des règles globales du root `AGENT.md`. Ce fichier précise uniquement les
contraintes locales des scripts.

# Must

- Utiliser `tsx` pour les scripts TypeScript.
- Charger ou parser explicitement les variables nécessaires ; `.env.local` n'est jamais implicite.
- Valider les variables critiques avant toute opération.
- Garder les scripts idempotents quand c'est possible.
- Logger les opérations importantes et afficher clairement l'environnement ciblé.
- Fermer explicitement les connexions ouvertes.
- Documenter toute commande dangereuse dans le README ou le script concerné.
- Pour accéder à la DB, créer une connexion dédiée à partir d'une `DATABASE_URL` explicitement chargée.
- Les scripts peuvent importer des schémas Drizzle, mais pas `db` depuis `@/lib/db`.
- `vercel-bootstrap.ts` pousse volontairement la même `DATABASE_URL` en `production`, `preview` et `development` pour le mode pilot/staging.
- `vercel:pull-env` régénère `.env.local` depuis Vercel production pour aligner le dev local sur la DB partagée assumée.

# Must not

- Ne jamais coder en dur secret, connection string, token Vercel, project id, URL client ou valeur de production.
- Ne jamais passer un secret en argument shell ; utiliser stdin, `.env.local` ignoré par Git ou variables locales.
- Ne jamais importer `@/lib/env`, module runtime Next.
- Ne jamais écrire de logique métier durable dans `scripts/`.
- Ne jamais modifier un schéma ou générer une migration depuis un script custom.
- Ne jamais exécuter `db:push` ou une opération destructive sur une DB partagée/staging/prod.
- Ne jamais exécuter d'opération destructive sans confirmation explicite.

# Patterns

- Vercel CLI : garder le cache local dans `.vercel-cache/`.
- Seed : données fictives uniquement. Les defaults `admin@example.local`, mot de passe local documenté et nom `Admin` sont tolérés uniquement dans `seed.ts` pour le développement.
- Seed : préférer `insert ... on conflict` ou une logique idempotente équivalente.
- Maintenance DB partagée : commande explicite, documentée, idempotente et non destructive.

# Checks

- `pnpm readiness:static` pour vérifier les frontières documentées.
- `pnpm readiness` avant livraison d'un changement de script.
