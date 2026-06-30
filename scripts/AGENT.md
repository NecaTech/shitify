# Scope

Scripts Node purs hors runtime Next.js :

- `init-project.ts` : initialisation post-clonage du template.
- `vercel-bootstrap.ts` : liaison Vercel, env vars, déploiement reproductible.
- `readiness.ts` : checks statiques et readiness.
- `seed.ts` : seed founder officiel et workspace initial.
- `assert-safe-db-env.ts` : garde-fou central des commandes DB/Vercel env.

Hérite des règles globales du root `AGENT.md`. Ce fichier précise uniquement les
contraintes locales des scripts.

# Must

- Utiliser `tsx` pour les scripts TypeScript.
- Charger ou parser explicitement les variables nécessaires ; `.env.local` n'est jamais implicite.
- Valider les variables critiques avant toute opération.
- Détecter le contexte de travail par le remote Git quand un script touche
  l'initialisation, la readiness, la DB, Vercel ou le dashboard de contrôle.
- En `workMode=boilerplate-source`, considérer `APP_ENV=dev` comme seul
  environnement cohérent ; `staging` et `prod` doivent être bloqués ou signalés
  comme incohérents.
- Garder les scripts idempotents quand c'est possible.
- Logger les opérations importantes et afficher clairement l'environnement ciblé.
- Fermer explicitement les connexions ouvertes.
- Documenter toute commande dangereuse dans le README ou le script concerné.
- Pour accéder à la DB, créer une connexion dédiée à partir d'une `DATABASE_URL` explicitement chargée.
- Les scripts peuvent importer des schémas Drizzle, mais pas `db` depuis `@/lib/db`.
- `init-project.ts` configure `APP_ENV=dev`, `CLIENT_SLUG` et `PROJECT_SLUG` afin que la baseline Drizzle soit générée par projet.
- `init-project.ts` est l'opération de sortie du boilerplate source vers un
  projet client ; après clonage depuis le template, il doit spécialiser le
  contexte local et remplacer le contrat `AGENT.md` boilerplate par un contrat
  projet client.
- `vercel-bootstrap.ts` doit respecter le mapping Vercel `development -> dev`, `preview -> staging`, `production -> prod`.
- `vercel:pull-env` production ne doit jamais écraser `.env.local` sans confirmation explicite.

# Must not

- Ne jamais coder en dur secret, connection string, token Vercel, project id, URL client ou valeur de production.
- Ne jamais passer un secret en argument shell ; utiliser stdin, `.env.local` ignoré par Git ou variables locales.
- Ne jamais importer `@/lib/env`, module runtime Next.
- Ne jamais écrire de logique métier durable dans `scripts/`.
- Ne jamais modifier un schéma ou générer une migration depuis un script custom.
- Ne jamais traiter le boilerplate source comme un projet à livrer en staging ou
  production.
- Ne jamais exécuter `db:push` ou une opération destructive sur une DB partagée/staging/prod.
- Ne jamais exécuter d'opération destructive sans confirmation explicite.

# Patterns

- Vercel CLI : garder le cache local dans `.vercel-cache/`.
- Seed : un seul mécanisme officiel, le seed Founder. Les variables sensibles sont obligatoires et aucun mot de passe ne doit être codé en dur.
- Seed : préférer `insert ... on conflict` ou une logique idempotente équivalente.
- Seed : ne jamais afficher le mot de passe ni le hash dans les logs.
- Seed : ne réinitialiser un mot de passe founder existant qu'avec une intention explicite (`FOUNDER_RESET_PASSWORD=true`).
- Maintenance DB partagée : commande explicite, documentée, idempotente et non destructive.
- Commandes DB : passer par `assert-safe-db-env.ts <operation>` avant Drizzle, seed ou pull Vercel.
- Migration/push : créer le schema PostgreSQL applicatif avec `--ensure-schema` avant Drizzle.
- Baseline Drizzle : ne pas générer de migration depuis un script custom ; laisser `pnpm db:generate` produire la baseline après `init-project`.
- `pull-env` production : exiger `CONFIRM_PULL_ENV_PROD=overwrite-env-local` si `.env.local` existe.

# Checks

- `pnpm readiness:static` pour vérifier les frontières documentées.
- `pnpm readiness` avant livraison d'un changement de script.
