import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/server";

export default async function Home() {
  const session = await getOptionalSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          NecaTech Boilerplate
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Next.js 16 · Better Auth · Drizzle ORM · Neon · Tailwind CSS 4
        </p>
      </div>

      <div className="bg-card border-border w-full max-w-2xl rounded-xl border p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Démarrage post-clonage</h2>

        <ol className="space-y-6">
          <Step number={1} title="Installer les dépendances">
            <Code>pnpm install</Code>
          </Step>

          <Step number={2} title="Initialiser le projet">
            <Code>pnpm init-project</Code>
            <p className="text-muted-foreground mt-2 text-sm">
              Configure le nom, l&apos;URL publique, le dépôt distant optionnel,
              crée <code className="text-foreground">.env.local</code> et génère
              le secret Better Auth.
            </p>
          </Step>

          <Step number={3} title="Configurer l'environnement">
            <p className="text-muted-foreground mt-2 text-sm">
              Vérifier les variables suivantes dans{" "}
              <code className="text-foreground">.env.local</code> :
            </p>
            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
              <li>
                <code className="text-foreground">DATABASE_URL</code> — URL
                PostgreSQL Neon (format <code>postgresql://...</code>)
              </li>
              <li>
                <code className="text-foreground">BETTER_AUTH_SECRET</code> —
                généré automatiquement par init-project
              </li>
              <li>
                <code className="text-foreground">BETTER_AUTH_URL</code> — URL
                de l&apos;app (ex. <code>http://localhost:3000</code>)
              </li>
              <li>
                <code className="text-foreground">NEXT_PUBLIC_APP_URL</code> —
                même URL (côté client)
              </li>
            </ul>
          </Step>

          <Step number={4} title="Appliquer les migrations">
            <Code>pnpm db:migrate</Code>
            <p className="text-muted-foreground mt-2 text-sm">
              Applique la migration initiale : auth, schémas génériques et CRUD
              configurable.
            </p>
          </Step>

          <Step number={5} title="Démarrer le serveur de développement">
            <Code>pnpm dev</Code>
            <p className="text-muted-foreground mt-2 text-sm">
              Cette page disparaît automatiquement une fois que vous avez
              remplacé <code className="text-foreground">src/app/page.tsx</code>{" "}
              par votre landing page.
            </p>
          </Step>
        </ol>

        <div className="border-border mt-8 border-t pt-6">
          <h3 className="mb-3 font-medium">Scripts utiles</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["pnpm dev", "Serveur de développement"],
              ["pnpm build", "Build production"],
              ["pnpm typecheck", "Vérification TypeScript"],
              ["pnpm lint", "ESLint"],
              ["pnpm db:studio", "Interface Drizzle Studio"],
              ["pnpm db:seed", "Seeder la base de données"],
              ["pnpm test", "Lancer les tests Vitest"],
              ["pnpm format", "Formatter le code (Prettier)"],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="flex flex-col gap-0.5">
                <code className="text-foreground text-xs">{cmd}</code>
                <span className="text-muted-foreground text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border mt-6 border-t pt-6">
          <h3 className="mb-3 font-medium">Architecture — rappel rapide</h3>
          <p className="text-muted-foreground text-sm">
            Flux de données :{" "}
            <code className="text-foreground">
              page.tsx → actions.ts → service.ts → repository.ts → lib/db
            </code>
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Référence : <code className="text-foreground">features/auth/</code>{" "}
            — implémentation complète du pattern.
          </p>
        </div>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="bg-foreground text-background flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {number}
      </span>
      <div className="flex-1">
        <p className="mb-2 font-medium">{title}</p>
        {children}
      </div>
    </li>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-muted text-foreground mt-1 rounded-md px-4 py-2 font-mono text-sm">
      {children}
    </pre>
  );
}
