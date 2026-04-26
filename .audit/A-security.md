# Agent A — Security & Auth Audit

## Verdict global

La fondation est saine (Better Auth bien configuré, env validé, headers HTTP solides, rate-limit ciblé), mais quelques angles morts subsistent : pas de cookies sécurisés explicites, pas d'`emailVerified` requis, CSP avec `'unsafe-inline'` sans nonce, et un paramètre `?redirect=` accepté par le proxy mais ignoré côté login. Rien de critique en l'état pour un boilerplate, mais plusieurs bonnes pratiques à activer avant la première mise en production sérieuse.

---

## Critique (bloquant ou risque sérieux)

Aucun blocker absolu. Voir les Important ci-dessous — certains deviennent critiques selon le cas d'usage (notamment l'absence de vérification d'email en prod).

---

## Important (à corriger avant usage sérieux)

### 1. `src/proxy.ts:18` — paramètre `?redirect=` non consommé → faux sentiment de sécurité + UX cassée

Le proxy fait `loginUrl.searchParams.set("redirect", pathname)` mais `LoginForm.tsx:28` redirige systématiquement vers `/dashboard` sans lire ce paramètre. Conséquence :

- L'utilisateur perd la destination originale à chaque login (UX dégradée).
- Quand quelqu'un l'implémentera, il y a un risque d'**open-redirect** s'il fait simplement `router.push(searchParams.get("redirect"))` sans valider.

**Correction :** soit retirer `searchParams.set("redirect", …)` du proxy, soit consommer le paramètre dans `LoginForm.tsx` avec validation stricte :

```ts
const target = searchParams.get("redirect") ?? "/dashboard";
const safe =
  target.startsWith("/") && !target.startsWith("//") ? target : "/dashboard";
router.push(safe);
```

Documenter dans `proxy.ts` que **seuls les paths internes commençant par `/` (et pas `//`) sont autorisés**.

### 2. `src/lib/auth/index.ts:22-27` — `requireEmailVerification: false` sans avertissement runtime

Le commentaire indique « set to true when email provider is configured », mais en prod un oubli signifie qu'un attaquant peut créer un compte avec n'importe quelle adresse (squatting, abus de réinitialisation, spam). Pour un boilerplate, c'est acceptable ; pour le projet dérivé, c'est dangereux.

**Correction :** ajouter un garde-fou explicite :

```ts
if (env.NODE_ENV === "production" && !env.EMAIL_PROVIDER_CONFIGURED) {
  logger.warn(
    "requireEmailVerification is disabled in production — risk of account squatting",
  );
}
```

Ou simplement faire échouer le build en prod tant qu'`EMAIL_PROVIDER_CONFIGURED !== "true"`.

### 3. `src/lib/auth/index.ts` — pas de configuration explicite des cookies de session

Better Auth applique des défauts sains, mais le boilerplate ne déclare pas `advanced.cookies` / `advanced.useSecureCookies`. En self-hosting (Docker derrière un reverse-proxy mal configuré, dev avec un tunnel HTTP, etc.), un cookie de session peut être émis sans `Secure` / `SameSite=Lax`. Pour un boilerplate « ready for production », c'est à expliciter.

**Correction :**

```ts
advanced: {
  useSecureCookies: env.NODE_ENV === "production",
  defaultCookieAttributes: { sameSite: "lax", secure: env.NODE_ENV === "production", httpOnly: true },
},
```

### 4. `next.config.ts:39-50` — CSP avec `script-src 'self' 'unsafe-inline'`

Le commentaire annonce le besoin de nonces mais la CSP actuelle reste **équivalente à pas de CSP** sur les attaques XSS basiques (n'importe quel script inline injecté passe). C'est honnête en commentaire, mais c'est le défaut le plus exploitable du boilerplate à date.

**Correction :** soit assumer le compromis et le documenter dans `CLAUDE.md` comme dette explicite à régler avant prod, soit fournir dès maintenant un middleware Next 16 (`proxy.ts`) qui :

1. génère un nonce par requête,
2. injecte `script-src 'self' 'nonce-XYZ' 'strict-dynamic'`,
3. expose le nonce via `headers()` pour les Server Components.

C'est une demi-journée de travail et c'est ce qui distingue un boilerplate jouet d'un boilerplate prod-ready.

### 5. `src/lib/auth/index.ts:24` — pas de politique de complexité de mot de passe (uniquement la longueur)

`minPasswordLength: 12` est correct mais insuffisant : `aaaaaaaaaaaa` passe. Better Auth n'inclut pas de validateur de complexité par défaut.

**Correction :** ajouter une validation côté serveur dans `signUp.email` via un hook Better Auth, ou (mieux) intégrer **zxcvbn** / un check contre la liste _Have I Been Pwned_ (k-anonymity) dans `passwordSchema` de `lib/validations/common.ts`. Pour un boilerplate, exiger au minimum `≥ 1 chiffre OU ≥ 1 symbole` ferme la porte aux mots de passe triviaux.

### 6. `src/lib/auth/index.ts:34-38` — pas de rate-limit sur `/reset-password`, `/verify-email`, `/change-password`, `/change-email`

`customRules` ne couvre que `/sign-in/email`, `/sign-up/email`, `/forget-password`. Le boilerplate prévoit (ou prévoira) reset/verify/change qui sont aussi des endpoints sensibles à brute-force / token guessing.

**Correction :** ajouter dès maintenant les règles, même si les endpoints ne sont pas exposés :

```ts
"/reset-password": { window: 60, max: 5 },
"/verify-email": { window: 60, max: 10 },
"/change-password": { window: 60, max: 5 },
"/change-email": { window: 60, max: 5 },
```

### 7. `src/features/auth/actions.ts:32-34` — `catch` muet qui avale toutes les erreurs

```ts
} catch {
  return { success: false, error: "Erreur interne" };
}
```

Le pattern est bon (pas de leak), mais **rien n'est loggé**. En prod tu n'auras aucune trace des échecs. Pour un boilerplate « reference implementation », c'est ce qui sera copié-collé — donc important.

**Correction :**

```ts
} catch (err) {
  logger.error({ err, userId: session.user.id }, "updateProfileAction failed");
  return { success: false, error: "Erreur interne" };
}
```

---

## Recommandations (bonnes pratiques manquantes)

### R1. `src/lib/env.ts` — manque `NODE_ENV` typé et un schéma serveur strict

Le module valide les 4 variables custom mais ne déclare pas `NODE_ENV`, ce qui force des `process.env.NODE_ENV` partout (`logger.ts:5,6`, `db/index.ts:18`, futurs hooks). Ajouter :

```ts
server: {
  ...,
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
},
```

### R2. `src/lib/auth/index.ts:9-12` — `trustedOrigins` accepte `VERCEL_URL` brut

`process.env.VERCEL_URL` est l'URL du **deployment courant**, pas de la branche — c'est OK. Mais : aucune validation que c'est un host `*.vercel.app`. Si quelqu'un override `VERCEL_URL` (Docker self-host par accident, test), Better Auth fera confiance à un origin arbitraire.

**Correction :**

```ts
if (process.env.VERCEL_URL?.endsWith(".vercel.app")) {
  trustedOrigins.push(`https://${process.env.VERCEL_URL}`);
}
```

### R3. `src/proxy.ts` — pas d'en-tête `X-Robots-Tag` sur `/login` et `/register`

Sans ça, ces pages peuvent finir indexées par Google → fuite de surface d'attaque + emails dans les rapports SEO. Ajouter dans `next.config.ts` un `headers` ciblé ou via le proxy :

```ts
if (isAuthRoute) {
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
```

### R4. `src/app/error.tsx:15-17` — affichage du `error.digest` à l'utilisateur

Ce n'est pas un secret en soi (c'est juste un hash), mais c'est inutile UX et invite à le partager dans les bug reports publics. Ne l'afficher qu'en `NODE_ENV !== "production"`, et logger côté serveur (`error.tsx` est client → pas possible directement, prévoir `useEffect` + endpoint de report ou Sentry).

### R5. `src/lib/auth/server.ts:13` — `redirect("/login")` sans `?redirect=`

`requireSession()` redirige toujours vers `/login` brut. Ne préserve pas l'URL d'origine. Si tu veux uniformiser avec le proxy (cf. point #1), fais-le ici aussi en passant `headers()` pour récupérer le `pathname`.

### R6. `src/features/auth/components/LoginForm.tsx` & `RegisterForm.tsx` — pas de validation Zod côté client

Les formulaires délèguent toute la validation à Better Auth (réseau). Pour la cohérence avec `actions.ts` et pour réduire les requêtes inutiles, réutiliser `emailSchema` / `passwordSchema` de `lib/validations/common.ts` côté client. Les `<input required minLength>` HTML actuels sont contournables trivialement (DevTools).

### R7. `next.config.ts` — `Permissions-Policy` minimal, manque plusieurs directives modernes

Actuellement : `camera=(), microphone=(), geolocation=()`. Ajouter au minimum : `interest-cohort=()`, `payment=()`, `usb=()`, `accelerometer=()`, `gyroscope=()`, `magnetometer=()`. C'est une déclaration de surface — gratuit et utile.

### R8. `src/lib/db/auth-schema.ts` — `session.token` non hashé en DB

Better Auth stocke le token de session en clair (`text("token").notNull().unique()`). Si la DB fuit, tous les tokens actifs sont exploitables tant qu'ils n'expirent pas. C'est un défaut Better Auth, pas du boilerplate, mais à documenter dans `CLAUDE.md` (« ne pas dump la table session sans précautions »).

### R9. CORS et CSRF sur `/api/auth/[...all]/route.ts`

Better Auth gère le CSRF via `trustedOrigins` + cookies SameSite, mais **aucune route API custom n'existe encore**. Quand l'utilisateur en ajoutera (prochaine étape inévitable), il n'y a aucun helper / middleware qui rappelle la check d'origine. Ajouter une note dans `CLAUDE.md` : « toute route `app/api/**` non gérée par Better Auth doit valider l'origin et la session via `requireSession()` + check `Origin === env.NEXT_PUBLIC_APP_URL` pour les méthodes mutantes ».

### R10. `.env.example:9` — pas d'avertissement sur la rotation du `BETTER_AUTH_SECRET`

Ajouter : « Rotater ce secret invalide TOUTES les sessions actives. À régénérer si compromis suspect. »

---

## Points corrects (brièvement)

- `lib/env.ts` valide `BETTER_AUTH_SECRET ≥ 32` chars et toutes les URLs (`z.string().url()`).
- `lib/auth/server.ts` distingue `requireSession()` (DB-validated) de `getOptionalSession()` ; la doc commentée dans le fichier est claire.
- `proxy.ts` est documenté comme cookie-only (perf-only, pas de signature) et chaque page protégée appelle bien `requireSession()` (cf. `(authenticated)/layout.tsx:14` + `dashboard/page.tsx:9`).
- Headers HTTP : HSTS avec `preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `COOP: same-origin`, `frame-ancestors 'none'` dans la CSP — solide.
- `poweredByHeader: false` dans `next.config.ts` — bon réflexe.
- Rate-limit ciblé sur `/sign-in/email` (5/min) et `/sign-up/email`+`/forget-password` (3/min) — paramétrage défensif correct.
- Cascade `onDelete: "cascade"` sur `session.userId` et `account.userId` — pas de session orpheline.
- `actions.ts` valide systématiquement avec Zod avant `requireSession()` → service.
- `findUserByEmail` lowercase l'email (`email.toLowerCase()`) — évite les bypasses de policy d'unicité.
- Pas de `console.log` en code prod, `logger` Pino en place.
- `server-only` correctement importé dans `auth/index.ts`, `db/index.ts`, `db/auth-schema.ts`, `logger.ts`, `repository.ts`, `service.ts`.

---

## Score : 7/10

Bonne hygiène générale, headers HTTP au-dessus de la moyenne, séparation `requireSession`/`getOptionalSession` propre. Pénalisé par : CSP `'unsafe-inline'` non résolue, cookies de session non explicitement durcis, `?redirect=` semi-implémenté qui ouvre un piège pour le prochain dev, et politique de mot de passe à la longueur uniquement. Les corrections sont toutes mécaniques (≤ 1 jour de dev) et amèneraient le score à 9/10.
