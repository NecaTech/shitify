# Agent D — Tooling & Dependencies Audit

## Verdict global

Le boilerplate est dans un état tooling solide : les couches critiques (strict TS, ESLint flat config, Husky + commitlint, CI complet, env-validation) sont toutes en place et correctement configurées. Les points à corriger sont mineurs à modérés — aucun bloquant en production.

---

## ❌ Critique (bloquant ou risque sérieux)

Aucun finding critique identifié.

---

## ⚠️ Important (à corriger avant usage sérieux)

**tsconfig.json**

- `"jsx": "react-jsx"` au lieu de `"preserve"`. Next.js 15+ recommande `"preserve"` (le bundler gère la transformation JSX). → Changer en `"preserve"`.
- `"exactOptionalPropertyTypes": true` absent. Option stricte importante pour éviter les bugs silencieux sur les props optionnelles. → Ajouter dans `compilerOptions`.

**next.config.ts**

- `experimental.typedRoutes: true` absent. Avec TS strict activé, les routes typées évitent les liens cassés au compile-time. → Ajouter `typedRoutes: true` sous `experimental`.

**ESLint**

- `@typescript-eslint/no-floating-promises` absent. Règle critique pour les Server Actions : un `await` oublié sur une action async est un bug silencieux. → Ajouter `"@typescript-eslint/no-floating-promises": "error"` dans `eslint.config.mjs`.

**Vitest / Testing**

- `vitest.config.mts` — `coverage` non configuré. Sans config coverage, `vitest run --coverage` utilise des defaults non déterministes. → Ajouter un bloc `coverage: { provider: "v8", reporter: ["text", "lcov"], exclude: ["node_modules", ".next", "tests"] }`.
- Script `test:coverage` absent dans `package.json`. → Ajouter `"test:coverage": "vitest run --coverage"`.

**CI**

- `build` est la dernière step alors qu'il peut fail sur des problèmes de config Next indépendants des tests. → Réordonner : typecheck → lint → format:check → build → test (fail-fast plus rapide).

---

## 💡 Recommandations (bonnes pratiques manquantes)

- **`.nvmrc` absent** — CI utilise Node 22, `engines` dit `>=20`. → Ajouter `.nvmrc` contenant `22`.
- **`.editorconfig` absent** — éditeurs non-VSCode peuvent introduire des incohérences d'indentation/line endings. → Ajouter fichier minimal (`indent_style = space`, `indent_size = 2`, `end_of_line = lf`).
- **`.gitattributes` absent** — clones Windows peuvent convertir LF en CRLF et casser les hooks Husky. → Ajouter `* text=auto eol=lf`.
- **`.vscode/extensions.json` absent** — pas de recommandations d'extensions pour les nouveaux contributeurs (ESLint, Prettier, Tailwind IntelliSense, Drizzle). → Créer `.vscode/extensions.json`.
- **`@next/bundle-analyzer` absent** — aucun moyen rapide d'inspecter le bundle. → Ajouter en devDep + script `"analyze": "ANALYZE=true pnpm build"`.
- **`pino-pretty` absent** — `pino` est en deps runtime mais `pino-pretty` (formatage lisible en dev) est absent. → Ajouter `pino-pretty` en devDependency.
- **`dotenv` en devDeps** — `db:seed` passe déjà `tsx --env-file=.env.local` (pas besoin de dotenv). `drizzle.config.ts` l'utilise mais `tsx --env-file` pourrait être utilisé aussi. Vérifier si `dotenv` est encore nécessaire.

---

## ✅ Points corrects

- **package.json** — toutes les dépendances runtime critiques présentes, aucun doublon conflictuel (`pg`/`prisma`/`next-auth` absents), `packageManager` et `engines` correctement définis.
- **package.json** — tous les scripts documentés dans `CLAUDE.md` présents. `lint-staged` correctement configuré.
- **tsconfig.json** — `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `moduleResolution: "bundler"`, plugin Next, paths `@/*` — correct.
- **next.config.ts** — `reactStrictMode`, `poweredByHeader: false`, `cacheComponents: true`, headers de sécurité complets (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, COEP), cache statique assets.
- **drizzle.config.ts** — `dialect: "postgresql"`, chemins corrects, `casing: "snake_case"`, `verbose: true`, `strict: true`, pas de fallback hard-codé.
- **eslint.config.mjs** — flat config ESLint 9, `next/core-web-vitals` + `next/typescript`, règles drizzle, `consistent-type-imports`, `no-console: warn`, `eslint-config-prettier` en fin de chaîne.
- **Prettier** — `prettier-plugin-tailwindcss` branché, options cohérentes.
- **vitest.config.mts** — extension `.mts` intentionnelle (ESM-only), `jsdom`, `globals`, `setupFiles`, `tsconfigPaths()`. `tests/setup.ts` correct.
- **Husky** — `pre-commit` (lint-staged) + `commit-msg` (commitlint) configurés. `commitlint` étendu `config-conventional`.
- **CI** — `pnpm/action-setup@v4` lit la version depuis `package.json`, Node 22, `--frozen-lockfile`, tous les checks présents, `SKIP_ENV_VALIDATION` pour le build.
- **Env vars** — `.env.example` complet (toutes variables documentées), aucun `.env`/`.env.local` commité, `.gitignore` pattern `.env*` + exception `!.env.example` correct.

---

## Score : 7.5/10

Fondations solides, aucun bloquant. Les -2.5 points portent sur l'absence de `exactOptionalPropertyTypes`, `typedRoutes`, `no-floating-promises`, la config coverage manquante, et les fichiers DX de base (`.nvmrc`, `.editorconfig`, `.gitattributes`).
