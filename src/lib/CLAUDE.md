# Règles de la couche Core / Infrastructure (`src/lib/`)

## Règles générales de l'Infrastructure

- **Sécurité serveur :** La directive `'server-only'` est OBLIGATOIRE dans : `auth/index.ts`, `db/index.ts`, et `logger.ts`.
- **Variables d'environnement :** Toujours importer depuis `env.ts`. L'utilisation directe de `process.env.X` est STRICTEMENT INTERDITE en dehors des exceptions documentées.

## Exceptions documentées pour `process.env`

1. `db/index.ts` : `process.env.NODE_ENV` toléré (non validé par t3-env).
2. `auth/index.ts` : `process.env.VERCEL_URL` toléré (injecté par Vercel, indisponible au build-time) + import direct `{ db }` depuis `@/lib/db` (requis par l'adapter Better Auth).
3. `drizzle.config.ts` & `scripts/seed.ts` : Scripts CLI Node purs, utilisation de `process.env` autorisée car `@t3-oss/env-nextjs` n'y est pas importable.

## Base de données (`lib/db/`)

- **Isolation architecturale :** Les modules de `lib/db/` ne peuvent être importés QUE dans les fichiers `repository.ts` des features ou les scripts de migration.
- **Requêtes :** Jamais de requêtes SQL brutes (`db.execute(sql\`...\`)`) pour le CRUD. L'utilisation du Query Builder de Drizzle est obligatoire.
- **Migrations :** Ne jamais écrire de migration SQL manuellement. Toujours utiliser `drizzle-kit generate` puis `drizzle-kit migrate`.
- **Génération Auth :** Le fichier `lib/db/auth-schema.ts` est autogénéré. Ne JAMAIS l'éditer manuellement. En cas de changement, relancer : `npx @better-auth/cli generate`.

## Variables d'environnement — configuration projet

- **`NEXT_PUBLIC_APP_URL`** — optionnel avec default `http://localhost:3000` pour le dev local. En production, **toujours le définir** avec l'URL réelle (utilisé pour `metadataBase` et les OG images).
- **`BETTER_AUTH_URL`** — obligatoire, utilisé pour `trustedOrigins`. Doit correspondre à l'URL publique de l'app en production.
- **`NEXT_PUBLIC_APP_URL` vs `BETTER_AUTH_URL`** — les deux doivent pointer vers la même URL en production. `BETTER_AUTH_URL` est server-only et conditionne le bon fonctionnement de l'auth ; `NEXT_PUBLIC_APP_URL` est client-side et conditionne les métadonnées.

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
