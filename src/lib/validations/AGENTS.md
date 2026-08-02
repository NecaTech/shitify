# Validations (`src/lib/validations/`)

## Structure

- `common.ts` — Schémas Zod partagés et réutilisables.
- Les validations spécifiques à une feature restent dans `features/<feature>/`.

## Règles

- Utiliser Zod pour toute validation d'entrée.
- Factoriser uniquement les schémas réellement partagés.
- Garder les schémas métier proches de leur feature.
- Exporter des schémas composables, pas des helpers opaques.
- Définir des messages d'erreur explicites quand l'erreur est exposée à l'utilisateur.
- Inférer les types avec `z.infer` uniquement si le type est réutilisé.

## Schémas partagés

- Placer ici uniquement les primitives réutilisables :
  - email
  - password
  - name
  - phone
  - id
  - pagination
- Ne pas placer ici de schéma lié à un domaine métier précis.

## Frontière architecturale

- Les Server Actions consomment les schémas Zod.
- Les services reçoivent des données déjà validées.
- Les repositories ne valident pas les entrées métier.
- Les composants UI ne remplacent jamais la validation serveur.

## Interdictions

- Ne jamais importer `db` dans `src/lib/validations/`.
- Ne jamais importer une feature dans `src/lib/validations/`.
- Ne jamais mettre de logique métier dans un schéma partagé.
- Ne jamais utiliser `any` pour contourner Zod.
- Ne jamais faire confiance à une validation client seule.
- Ne jamais dupliquer un schéma commun dans plusieurs features.
