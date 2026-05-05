# Scripts (`scripts/`)

## Structure

- `seed.ts` — Script de seed projet. À adapter par projet client.
- `init-project.ts` — Initialisation post-clonage du template.
- `vercel-bootstrap.ts` — Liaison Vercel, synchronisation des variables et déploiement reproductible.
- `readiness.ts` — Vérifications statiques avant démo/livraison.
- Les scripts sont exécutés hors runtime Next.js.
- Les scripts sont des programmes Node purs.

## Règles

- Utiliser `tsx` pour exécuter les scripts TypeScript.
- Charger explicitement les variables d'environnement nécessaires.
- Valider les variables critiques avant toute opération.
- Écrire des scripts idempotents quand c'est possible.
- Logger les opérations importantes.
- Terminer explicitement les connexions ouvertes si nécessaire.
- Documenter toute commande dangereuse dans le README ou le script concerné.
- Ne jamais coder en dur un secret, une connection string, un token Vercel, un project id, une URL client ou une valeur de production pour contourner une invite CLI ou une erreur de build.

## Environnement

- `process.env` est autorisé dans `scripts/`.
- Ne pas importer `@/lib/env` dans les scripts.
- Ne jamais supposer que `.env.local` est chargé automatiquement : le charger explicitement ou le parser dans le script.
- Charger l'environnement via `dotenv/config` ou configuration équivalente.
- Refuser l'exécution si une variable critique est absente.

## Base de données

- Les scripts ne doivent pas importer `db` depuis `@/lib/db`, car ce module est `server-only` et dépend de l'environnement Next validé.
- Les scripts peuvent importer les schémas Drizzle.
- Les scripts qui doivent accéder à la DB créent leur propre connexion (`Pool`, Drizzle CLI config, etc.) à partir d'une `DATABASE_URL` explicitement chargée.
- Ne jamais exécuter un script destructif sans garde explicite.
- Les scripts de maintenance peuvent cibler la DB partagée local/prod uniquement si la commande est explicite, documentée, idempotente, et non destructive.
- Ne jamais exécuter `db:push` ou une opération destructive sur la DB partagée local/prod.
- Afficher clairement l'environnement ciblé avant exécution.

## Vercel

- `vercel-bootstrap.ts` pousse volontairement la même `DATABASE_URL` dans `production`, `preview` et `development` pour que local, preview et prod partagent la même DB.
- `vercel:pull-env` régénère `.env.local` depuis l'environnement Vercel `production`.
- Les secrets ne doivent jamais être passés dans les arguments shell ; utiliser stdin, fichier `.env.local` ignoré par Git, ou variables d'environnement locales.
- Le cache CLI Vercel doit rester local et ignoré (`.vercel-cache/`) pour fonctionner dans les environnements agent/sandbox.
- Si le CLI demande une information, l'obtenir via option explicite (`--project`, `--team`, `--token`), prompt utilisateur, variable d'environnement locale, ou fichier `.env.local`. Ne pas remplacer l'interaction par une constante projet codée en dur.

## Seed

- Les données de seed doivent être fictives.
- Les defaults fictifs (`admin@example.local`, mot de passe local documenté, nom `Admin`) sont tolérés uniquement dans `seed.ts` et uniquement pour le développement.
- Ne jamais inclure de données client réelles.
- Le seed doit pouvoir être rejoué sans casser la base.
- Préférer `insert ... on conflict` ou nettoyage contrôlé selon le besoin.
- Les mots de passe de seed doivent être documentés et réservés au développement.

## Interdictions

- Ne jamais écrire de logique métier durable dans `scripts/`.
- Ne jamais modifier un schéma depuis un script.
- Ne jamais générer de migration depuis un script custom.
- Ne jamais utiliser un script comme contournement d'une règle d'architecture.
- Ne jamais exécuter d'opération destructive sans confirmation explicite.
