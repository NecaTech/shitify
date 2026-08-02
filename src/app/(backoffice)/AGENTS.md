# Routes du back-office (`src/app/(backoffice)/`)

- `backoffice` désigne l’ensemble de l’interface privée de gestion et d’exploitation.
- Le layout appelle `requireSession()` et rend le shell privé commun.
- `dashboard/` contient uniquement la synthèse générale Pilote.
- Les modules privés sont des enfants directs du groupe, par exemple `administration/`.
- `authenticated` décrit une contrainte d’accès, pas une frontière fonctionnelle.
- Toute nouvelle route privée est ajoutée au registre centralisé de `src/proxy.ts`.
