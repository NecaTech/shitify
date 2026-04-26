# Agent B — Next.js / Vercel Performance Audit

## Verdict global (2 phrases max)

Le boilerplate exploite correctement les nouveautés Next 16 (`cacheComponents`, `'use cache'`, `proxy.ts`, route group `(authenticated)`) et la configuration de base (headers, cache static, fonts) est solide. Restent quelques angles morts performance : `home page` non-streamée, absence totale de `<Suspense>` pour PPR, oubli de `cacheLife`, et un trade-off `requireSession()` dans le layout qui sérialise tout le sous-arbre auth.

---

## ❌ Critique (bloquant ou risque sérieux)

### 1. `src/app/(authenticated)/layout.tsx:14` — bloque le streaming PPR sur tout `/dashboard/*`

`await requireSession()` est appelé en haut du layout, **hors `<Suspense>`**. Avec `cacheComponents: true` activé, cela force tout le rendu du sous-arbre authentifié à attendre le round-trip DB de Better Auth avant que le navigateur reçoive le moindre octet. Le commentaire dit "Better Auth met en cache au niveau de la requête" — c'est vrai pour les ré-appels dans `page.tsx`, mais ça ne change rien au TTFB du **premier** appel qui bloque le shell statique.

**Correction :** déplacer la garde dans une `<Suspense>` boundary, ou utiliser un pattern de shell statique + composant async :

```tsx
// layout.tsx — garde shell instant
export default function AuthenticatedLayout({ children }) {
  return (
    <>
      <AuthGuard /> {/* async, dans Suspense */}
      <Suspense fallback={<SidebarSkeleton />}>{children}</Suspense>
    </>
  );
}
```

Ou plus simple : laisser la garde dans `page.tsx` (chaque page protégée appelle `requireSession()` directement) et supprimer le layout, ce qui permet à Next d'envoyer le shell pendant la validation.

### 2. `src/app/page.tsx:5` — `getOptionalSession()` au top-level désactive la prerender static de la home

La home est listée comme `PARTIALLY_STATIC` dans `prerender-manifest.json`, mais le `await getOptionalSession()` synchrone en début de composant force un fetch dynamique à chaque requête. Conséquence : la home n'est jamais servie depuis le CDN, chaque visiteur paye un round-trip DB Neon (~50-200ms cold) avant le moindre HTML.

**Correction :** isoler la personnalisation dans un composant async sous `<Suspense>`, ou faire la redirection côté `proxy.ts` (vérifier la session-cookie présente sur `/` et rediriger). Le shell marketing devient alors entièrement statique.

```tsx
// page.tsx
export default function Home() {
  return (
    <>
      <Suspense>
        <SessionRedirect />
      </Suspense>
      <MarketingShell />
    </>
  );
}
```

---

## ⚠️ Important (à corriger avant usage sérieux)

### 3. `src/features/auth/repository.ts:8` — `'use cache'` sans `cacheLife()`

`findUserById` est marqué `'use cache'` + `cacheTag(\`user:${id}\`)`mais aucun`cacheLife()`n'est défini. Avec`cacheComponents: true`, le cache utilise le profil `default`de Next 16 — ce qui peut signifier "infini en mémoire jusqu'à`revalidateTag`". OK pour ce repo (l'action mute via `revalidateTag`), mais c'est fragile : tout consommateur futur qui oublie `revalidateTag` aura des données stale indéfiniment.

**Correction :** ajouter explicitement un profil :

```ts
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from "next/cache";
export async function findUserById(id: string) {
  "use cache";
  cacheLife("hours"); // safety net en cas d'oubli de revalidateTag
  cacheTag(`user:${id}`);
  ...
}
```

### 4. `src/app/(authenticated)/dashboard/page.tsx:9-12` — pas de `<Suspense>` autour du fetch utilisateur

`requireSession()` puis `getUserById()` sont awaitées séquentiellement et bloquent le rendu complet. Aucun `loading.tsx` dans le segment `(authenticated)/dashboard/`. Le header du dashboard ("Connecté en tant que…") pourrait se rendre instantanément pendant que le profil charge.

**Correction :** créer `src/app/(authenticated)/dashboard/loading.tsx` + envelopper `<ProfileForm>` dans une `<Suspense>` avec un composant async dédié :

```tsx
<Suspense fallback={<ProfileSkeleton />}>
  <ProfileSection userId={session.user.id} />
</Suspense>
```

### 5. `src/proxy.ts:30` — matcher trop permissif

```ts
matcher: ["/dashboard/:path*", "/login", "/register"];
```

C'est explicite et performant — bon point. Mais le matcher ne couvre **pas** la home `/`. Conséquence directe : la redirection de l'utilisateur authentifié vers `/dashboard` est faite au runtime dans `page.tsx` (cf. finding #2). Si elle était dans `proxy.ts`, on pourrait keep la home statique.

**Correction :** ajouter `/` au matcher et déporter la logique de redirection ici (uniquement si `getSessionCookie` présent — pas de DB call).

### 6. `next.config.ts:55` — pattern Cache-Control rate les fichiers `.css` et `.js`

Le pattern `(svg|jpg|jpeg|png|gif|ico|webp|avif|woff2)` couvre les images et `woff2`, mais oublie : `woff` (legacy), `ttf`, `otf`, et surtout les hashed bundles `_next/static/*`. Next gère lui-même `_next/static/*` en `immutable` donc OK pour les bundles, mais les assets servis depuis `/public` autres que ceux listés (ex: PDF, JSON statique, fonts custom) tombent sur le default cache.

**Correction :** ajouter `woff|ttf|otf|pdf` au pattern, ou (mieux) utiliser deux règles : une pour les fonts (immutable), une pour les images.

---

## 💡 Recommandations (bonnes pratiques manquantes)

### 7. Aucun `<Suspense>` dans tout le projet

`grep -r "Suspense"` retourne zéro résultat. Avec `cacheComponents: true` (PPR activé), c'est précisément le mécanisme qui sépare la partie statique de la partie dynamique. Sans `<Suspense>`, PPR n'a rien à streamer — le bénéfice de `cacheComponents` est perdu.

### 8. `next.config.ts` — manque `compress`, `productionBrowserSourceMaps: false`, `experimental.reactCompiler`

- `compress: true` est le default mais à expliciter pour clarté.
- `productionBrowserSourceMaps: false` (default) à confirmer — éviter d'expédier des sourcemaps en prod (taille bundle + leak code).
- `experimental.reactCompiler` (React 19 compiler) — disponible et stable, gain mesurable de ~10-30% sur re-renders. À activer.

### 9. `src/app/layout.tsx` — Geist_Mono préchargé sans utilisation

```ts
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

Geist_Mono est chargé sur **toutes** les pages mais n'est utilisé que dans les `<pre>/<code>` de la page home et nulle part ailleurs. Sur les pages auth/dashboard c'est un téléchargement de ~20-30KB pur waste.

**Correction :** ajouter `preload: false` à Geist_Mono, ou ne le charger qu'au niveau de la page home.

### 10. `src/app/(authenticated)/dashboard/page.tsx` — pas de `export const experimental_ppr = true`

Avec `cacheComponents: true`, PPR est opt-in par défaut au niveau global, mais beaucoup de devs activent `experimental_ppr` explicitement par segment pour être sûrs du comportement. Le `prerender-manifest.json` montre `PARTIALLY_STATIC` partout — donc OK actuellement, mais à documenter.

### 11. Vercel Fluid Compute — pas de `export const runtime` ni `maxDuration` explicites

Aucun fichier ne déclare `runtime = "nodejs"` ni `maxDuration`. C'est OK (default = nodejs sous Fluid), mais pour le `route.ts` d'auth (`api/auth/[...all]/route.ts`) qui peut faire du `verifyEmail`, du hashing bcrypt (~100-300ms), ajouter `export const maxDuration = 30` est une bonne ceinture de sécurité.

### 12. `src/app/page.tsx:96-102` — `Array.map` avec inline objects, sans `key` stable optimal

```tsx
{[["pnpm dev","..."], ...].map(([cmd, desc]) => (<div key={cmd}>...))}
```

C'est une page boilerplate one-shot, mais le pattern `key={cmd}` est OK. Plus important : tout ce JSX statique pourrait être pré-rendu au build si on dégage le `await getOptionalSession()` du top (cf. finding #2).

### 13. `next.config.ts` — pas de `images.formats` ni `images.deviceSizes`

Le bloc `images` est vide. Quand le user va commencer à utiliser `<Image>`, il aura les défauts qui ne sont pas optimaux pour mobile-first :

- Ajouter `formats: ["image/avif", "image/webp"]`
- Définir `deviceSizes` adaptés (ex: `[640, 750, 828, 1080, 1200, 1920]` au lieu de `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`)

### 14. `src/app/error.tsx` — pas de `logger` ni report d'erreur

Le boundary attrape l'erreur mais ne fait rien. En prod sur Vercel, un appel à un endpoint d'observabilité (Sentry, Axiom, ou simple `fetch('/api/log-error')`) serait utile. Sinon, retirer le commentaire — c'est juste un display passif.

---

## ✅ Points corrects (brièvement)

- `cacheComponents: true` + `'use cache'` + `cacheTag` + `revalidateTag(_, "default")` — pattern Next 16 propre.
- `proxy.ts` utilise `getSessionCookie` (cookie-only, no DB) — correct pour Edge perf.
- `poweredByHeader: false` — bon.
- Headers cache `immutable` 1-an sur les images statiques — bon.
- `next/font/google` avec `display: "swap"` — bon.
- Route group `(authenticated)` qui factorise la garde — bonne intention (mais cf. finding #1 sur le streaming).
- `optimizePackageImports: ["lucide-react"]` — correct, et `radix-ui` retiré comme noté.
- `Pool` Neon en singleton via `globalForDb` — bon.
- `metadataBase` configuré — évite les warnings OG image.
- Pas de `next/dynamic` mais aussi pas de heavy client lib qui le nécessite — neutre.

---

## Score : 6.5/10

Solide sur la config et les fondamentaux Next 16, mais le boilerplate **n'exploite pas** ce que `cacheComponents: true` permet (zéro `<Suspense>`, layout `(authenticated)` qui bloque le shell, home qui force du dynamique inutilement). Pour un boilerplate qui se veut "Next 16 reference", le pattern PPR doit être démontré au moins une fois — actuellement il est invisible. Les findings 1-2-7 sont rapides à corriger et débloquent un vrai gain TTFB.
