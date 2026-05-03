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
3. **Pas de style global :** Interdiction d'utiliser `@layer base` pour styliser des balises HTML (h1, p, a, ul). Exception tolérée : `* { @apply border-border outline-ring/50; }` est l'initialisation du design system Shadcn, pas un style de contenu.
4. **Usage exclusif :** Typographie et espacements appliqués via classes Tailwind directement dans les composants React.
5. **Zéro valeur magique :** Interdiction d'utiliser des valeurs arbitraires (`w-[15px]`, `bg-[#ff0000]`). Toute nouvelle valeur doit être ajoutée au `theme` via le fichier `tokens.css`.
6. **Sémantique uniquement :** Ne jamais utiliser de couleurs brutes. Utiliser les variables sémantiques (ex: `bg-background`) définies dans Shadcn/Theme.

## Comportement de `@theme inline` — Règle critique

`@theme inline` génère des classes Tailwind utilitaires mais **ne crée pas de propriétés CSS custom au runtime**. Conséquence directe :

**Interdit** — la syntaxe arbitraire avec référence à une variable du `@theme inline` :

```html
<!-- CASSÉ : var(--spacing-container) n'existe pas dans le DOM -->
<div class="max-w-[--spacing-container] px-[--spacing-gutter]">
  <h1 class="text-[--text-display-hero]">
    <p class="max-w-[--max-w-prose]"></p>
  </h1>
</div>
```

**Obligatoire** — utiliser la classe utilitaire générée directement :

```html
<!-- CORRECT : Tailwind a inliné la valeur à la compilation -->
<div class="max-w-container px-gutter">
  <h1 class="text-display-hero">
    <p class="max-w-prose"></p>
  </h1>
</div>
```

La règle est simple : si le token est dans `@theme inline`, sa classe utilitaire est le seul point d'accès valide.

## Correspondance namespaces `@theme` → classes Tailwind

| Clé dans `@theme`     | Classe générée                   | Exemple d'usage     |
| --------------------- | -------------------------------- | ------------------- |
| `--spacing-container` | `max-w-container`, `w-container` | `max-w-container`   |
| `--spacing-gutter`    | `px-gutter`, `p-gutter`          | `px-gutter`         |
| `--spacing-sidebar`   | `w-sidebar`                      | `w-sidebar`         |
| `--text-display-hero` | `text-display-hero`              | `text-display-hero` |
| `--tracking-label`    | `tracking-label`                 | `tracking-label`    |
| `--shadow-card`       | `shadow-card`                    | `shadow-card`       |
| `--max-w-prose`       | `max-w-prose`                    | `max-w-prose`       |

## `min-h-full` vs `min-h-dvh`

`min-h-full` sur un wrapper de layout est inopérant si les ancêtres (`html`, `body`) n'ont pas `h-full`. Préférer systématiquement `min-h-dvh` sur les wrappers de layout racine (`PublicLayout`, `AppLayout`, `body`). `min-h-full` ne doit s'utiliser que dans un contexte où le parent a une hauteur explicite.

## `@layer base` — périmètre autorisé

Seule cette forme est autorisée dans `globals.css` :

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
```

Le `body { @apply bg-background text-foreground; }` doit être porté par le composant React racine (`<body className="bg-background text-foreground ...">` dans `layout.tsx`), pas par `@layer base`.

## Tokens de couleurs sémantiques — ne pas réécrire la sémantique Shadcn

Les tokens `--secondary`, `--accent`, `--muted` ont une sémantique Shadcn que les composants UI consomment directement (`bg-secondary` dans les boutons, etc.). Ne jamais les remapper vers des couleurs du design system qui brisent cette sémantique. Si le design system a besoin d'une couleur "ardoise", créer un token dédié (`--sidebar`, `--surface-dark`) plutôt que de détourner `--secondary`.
