# Scripts (`scripts/`)

## Structure

- `seed.ts` — Script de seed projet. À adapter par projet client.
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

## Environnement

- `process.env` est autorisé dans `scripts/`.
- Ne pas importer `@/lib/env` dans les scripts.
- Ne jamais supposer que `.env.local` est chargé automatiquement.
- Charger l'environnement via `dotenv/config` ou configuration équivalente.
- Refuser l'exécution si une variable critique est absente.

## Base de données

- Les scripts peuvent importer `db` depuis `@/lib/db`.
- Les scripts peuvent importer les schémas Drizzle.
- Ne jamais exécuter un script destructif sans garde explicite.
- Ne jamais cibler une base de production par défaut.
- Afficher clairement l'environnement ciblé avant exécution.

## Seed

- Les données de seed doivent être fictives.
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
