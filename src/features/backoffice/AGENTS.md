# Feature Back-office (`src/features/backoffice/`)

- Cette feature porte le shell privé global, sa navigation, son chrome et les capacités d’exploitation communes.
- La synthèse Pilote et ses composants spécifiques restent dans `src/features/dashboard/`.
- Les modules métier du back-office ne doivent pas être rangés sous la feature `dashboard` par héritage historique.
- `dashboard` désigne la vue synthétique ; `backoffice` désigne l’espace privé global.
