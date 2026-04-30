# Règles de Style et Architecture CSS

## Philosophie

- **Séparation stricte :** Le CSS est une couche de configuration, pas de logique applicative.
- **Tailwind v4 :** Utilisation intensive du système de configuration `@theme`.

## Organisation des fichiers

- `theme/colors.css` : Uniquement variables brutes `oklch` (blocs `:root` et `.dark`).
- `theme/typography.css` : Uniquement pointeurs de polices (`--font-sans`).
- `theme/tokens.css` : Uniquement le bloc `@theme inline` (mapping Tailwind).
- `animations.css` : Uniquement `@keyframes` et effets stricts.
- **Interdiction formelle :** Ne jamais écrire de CSS standard (sélecteurs de classes, ciblage HTML) dans ce dossier.

## Règles d'or (Interdictions absolues)

1. **Pas de CSS Reset manuel :** Tailwind gère le Preflight.
2. **Pas de redéfinition système :** Ne jamais recréer les primitives (`--text-sm`, `--spacing-4`, etc.).
3. **Pas de style global :** Interdiction d'utiliser `@layer base` pour styliser des balises HTML (h1, p, a, ul).
4. **Usage exclusif :** Typographie et espacements appliqués via classes Tailwind directement dans les composants React.
5. **Zéro valeur magique :** Interdiction d'utiliser des valeurs arbitraires (`w-[15px]`, `bg-[#ff0000]`). Toute nouvelle valeur doit être ajoutée au `theme` via le fichier `tokens.css`.
6. **Sémantique uniquement :** Ne jamais utiliser de couleurs brutes. Utiliser les variables sémantiques (ex: `bg-background`) définies dans Shadcn/Theme.
