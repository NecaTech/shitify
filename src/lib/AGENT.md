# Règles de la couche Core / Infrastructure (`src/lib/`)

## Règles générales de l'Infrastructure

- **Sécurité serveur :** La directive `'server-only'` est OBLIGATOIRE dans : `auth/index.ts`, `db/index.ts`, et `logger.ts`.
- **Variables d'environnement :** Toujours importer depuis `env.ts`. L'utilisation directe de `process.env.X` est STRICTEMENT INTERDITE en dehors des exceptions documentées.
- **Anti-hardcoding :** Aucun secret, URL de production, identifiant Vercel/Neon, email admin, rôle privilégié ou valeur d'environnement ne doit être codé en dur dans `src/lib/`. Utiliser `env.ts`, `.env.local`, Vercel env ou une configuration projet typée.

## Exceptions documentées pour `process.env`

1. `env.ts` : lecture centralisée des variables validées par `@t3-oss/env-nextjs`, y compris `VERCEL_PROJECT_PRODUCTION_URL` et `VERCEL_URL` pour le fallback Vercel.
2. `db/index.ts` : `process.env.NODE_ENV` toléré (non validé par t3-env).
3. `logger.ts` : `process.env.NODE_ENV` toléré pour choisir le niveau de log et le transport de développement.
4. `auth/index.ts` : `process.env.VERCEL_URL`, `process.env.VERCEL_PROJECT_PRODUCTION_URL` et `process.env.NODE_ENV` tolérés pour `trustedOrigins` et le fallback localhost hors production.
5. `drizzle.config.ts` et `scripts/*` : scripts CLI Node purs, utilisation de `process.env` autorisée selon `scripts/AGENT.md`.

## Base de données (`lib/db/`)

- **Isolation architecturale :** `db` depuis `@/lib/db` ne peut être importé QUE dans les fichiers `repository.ts` des features, l'adapter Better Auth (`src/lib/auth/index.ts`) ou les scripts de migration/maintenance explicitement documentés.
- **Schémas partagés :** `auth-schema.ts` peut être importé par les `schema.ts` des features pour déclarer les relations vers `user`.
- **Requêtes :** Jamais de requêtes SQL brutes (`db.execute(sql\`...\`)`) pour le CRUD. L'utilisation du Query Builder de Drizzle est obligatoire.
- **Migrations :** Ne jamais écrire de migration SQL manuellement. Toujours utiliser `drizzle-kit generate` puis `drizzle-kit migrate`.
- **Génération Auth :** Le fichier `lib/db/auth-schema.ts` est autogénéré. Ne JAMAIS l'éditer manuellement. En cas de changement, relancer : `npx @better-auth/cli generate`.

## Variables d'environnement — configuration projet

- **`NEXT_PUBLIC_APP_URL`** — optionnel avec fallback Vercel (`VERCEL_PROJECT_PRODUCTION_URL`, puis `VERCEL_URL`) et default `http://localhost:3000` pour le dev local. En production avec domaine custom, le définir avec l'URL réelle.
- **`BETTER_AUTH_URL`** — obligatoire hors Vercel, utilisé pour `trustedOrigins`. Sur Vercel, fallback sur `VERCEL_PROJECT_PRODUCTION_URL`, puis `VERCEL_URL`.
- **`NEXT_PUBLIC_APP_URL` vs `BETTER_AUTH_URL`** — les deux doivent pointer vers la même URL en production. `BETTER_AUTH_URL` est server-only et conditionne le bon fonctionnement de l'auth ; `NEXT_PUBLIC_APP_URL` est client-side et conditionne les métadonnées.
- **Interdit :** Ajouter une valeur de secours production codée en dur (`https://...vercel.app`, connection string, token, secret) pour contourner une erreur de build. Le fallback autorisé est uniquement dérivé des variables système Vercel ou des env vars validées.

## Authentification / Proxy — Contrat anti-boucle

Le proxy (`src/proxy.ts`) et `requireSession()` (`src/lib/auth/server.ts`) doivent impérativement coopérer pour éviter une boucle de redirection.

**Scénario de boucle :**

1. Cookie de session présent mais invalide (expiré, DB injoignable...)
2. Proxy sur une route protégée → cookie OK → laisse passer
3. `requireSession()` → `auth.api.getSession()` échoue → `redirect("/login")`
4. Proxy sur `/login` → cookie présent → `redirect("/dashboard")`
5. Retour à 2 → boucle infinie

**Correctif obligatoire en deux points :**

1. **`proxy.ts`** : ne pas rediriger depuis `/login` si un paramètre `redirect` est présent :

```ts
if (isAuthRoute && session && !request.nextUrl.searchParams.has("redirect")) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

2. **`server.ts`** : `requireSession()` doit passer le pathname courant :

```ts
export async function requireSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    const pathname = headersList.get("x-current-path") ?? "/";
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }
  return session;
}
```

## Observabilité / Logging

- **Serveur :** Utiliser exclusivement `logger` importé de `lib/logger.ts` (Pino, server-only). Interdiction d'utiliser `console.log` en production.
- **Client :** L'utilisation de l'objet natif `console` est autorisée uniquement en développement.
