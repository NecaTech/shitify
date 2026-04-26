# Agent E — Code Quality & TypeScript Audit

## Verdict global

Le boilerplate est globalement solide : architecture en couches respectée, TypeScript strict appliqué, patterns React 19 corrects. Deux-trois points mineurs méritent correction avant usage sérieux en production.

---

## ❌ Critique (bloquant ou risque sérieux)

Aucun finding critique.

---

## ⚠️ Important (à corriger avant usage sérieux)

**1. `src/app/layout.tsx:27` — fallback `??` superflu sur une valeur validée par Zod**

```ts
metadataBase: new URL(env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
```

`env.NEXT_PUBLIC_APP_URL` est déclaré `z.string().url()` dans `lib/env.ts` — il ne peut pas être `undefined` à l'exécution (sauf `SKIP_ENV_VALIDATION=true`). Le fallback masque silencieusement un oubli de variable en prod : Next.js démarrera sans erreur avec `http://localhost:3000` comme `metadataBase`.

Correction : supprimer le `?? "http://localhost:3000"`.

```ts
metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
```

Si un fallback CI est voulu, le déclarer dans `lib/env.ts` avec `.optional().default("http://localhost:3000")` et le documenter.

---

**2. `src/features/auth/actions.ts:18-19` — `requireSession()` appelé avant la validation Zod**

```ts
const session = await requireSession(); // DB round-trip
const parsed = updateProfileSchema.safeParse(input); // validation input
```

La session est vérifiée (round-trip DB) avant de valider l'input. L'ordre idiomatique est : valider l'input d'abord, authentifier ensuite. L'impact est faible (action protégée), mais c'est un anti-pattern dans le pattern de référence.

Correction : inverser l'ordre.

```ts
const parsed = updateProfileSchema.safeParse(input);
if (!parsed.success) {
  return {
    success: false,
    error: parsed.error.issues[0]?.message ?? "Données invalides",
  };
}
const session = await requireSession();
```

---

**3. `src/features/auth/components/ProfileForm.tsx:47` — feedback succès/erreur visuellement identique**

```tsx
{
  message && <p className="text-muted-foreground text-sm">{message}</p>;
}
```

Messages d'erreur et de succès affichés avec la même couleur. Un utilisateur ne peut pas distinguer les deux états.

Correction : stocker le résultat complet ou une flag `isSuccess` dans le state, puis conditionner la classe :

```tsx
<p
  className={`text-sm ${isSuccess ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
>
  {message}
</p>
```

---

## 💡 Recommandations (bonnes pratiques manquantes)

**4. `src/features/auth/components/ProfileForm.tsx` — `<input>` natif au lieu du composant shadcn**

Le formulaire utilise un `<input>` HTML natif alors que `Button` est bien importé depuis `@/components/ui`. Seul `button.tsx` existe dans `components/ui/` — il manque `input.tsx`. Ajouter le composant via `npx shadcn add input` pour la cohérence visuelle (`aria-invalid`, ring de focus, dark mode).

---

**5. `src/types/result.ts` — `data: void` sur la branche success quand `T = void`**

```ts
| { success: true; data: T }
```

Avec `T = void`, les appelants doivent écrire `{ success: true, data: undefined }`. Un type conditionnel améliore l'ergonomie :

```ts
export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };
```

Impact faible mais utile pour les actions sans valeur de retour.

---

**6. `src/lib/validations/common.ts:5-7` — `passwordSchema` sans contrainte de complexité**

```ts
export const passwordSchema = z.string().min(12, "...");
```

12 caractères minimum mais aucune contrainte de complexité. Pour un boilerplate de référence, ajouter un `TODO` explicite ou une validation de base (regex) pour éviter que les projets dérivés oublient cet aspect sécurité.

---

## ✅ Points corrects

- **TypeScript strict** : aucun `any`, aucun cast injustifié dans les fichiers audités.
- **Types de retour explicites** : toutes les Server Actions typées (`Promise<ActionResult<User>>`).
- **Imports** : 100% via alias `@/`, aucun chemin relatif profond.
- **`lib/env.ts`** : utilisé systématiquement, aucun `process.env.X` direct dans le code applicatif (hors exceptions légales documentées).
- **`lib/utils.ts`** : `cn()` avec `clsx` + `tailwind-merge`, minimal et correct.
- **`ActionResult<T>`** : discriminated union bien formée, utilisée de façon cohérente.
- **`AuthResult` déprécié** : correctement annoté `@deprecated` avec redirection vers `ActionResult`.
- **shadcn/ui** : `components.json` correctement configuré (`cssVariables: true`, alias corrects, `rsc: true`).
- **`button.tsx`** : `cva` + `cn`, expose `buttonVariants`, aucun style inline, variantes Tailwind uniquement — conforme Tailwind 4.
- **`ProfileForm.tsx`** : `useTransition` correctement utilisé pour Server Actions, `isPending` propagé au bouton et à l'input.
- **Route group `(authenticated)/layout.tsx`** : `requireSession()` appelé une seule fois au niveau layout — pattern correct.
- **`repository.ts`** : `server-only` importé, `'use cache'` + `cacheTag` sur `findUserById`, absence justifiée sur `findUserByEmail`.
- **`service.ts`** : `server-only` importé, Pino utilisé (pas de `console.log`), validation d'existence avant mutation.
- **Nommage** : kebab-case fichiers, PascalCase composants, camelCase fonctions — cohérent.

---

## Score : 8.5/10

Code propre, bien typé, architecture respectée. Les 3 points "important" sont des corrections de moins de 5 minutes. L'absence du composant `Input` shadcn est le seul manque structurel notable — il crée une incohérence dans le pattern de référence.
