import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          NecaTech Boilerplate
        </h1>
        <p className="text-muted-foreground mt-2">
          Next.js 16 · Better Auth · Drizzle ORM · Neon · Tailwind CSS 4
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Créer un compte</Link>
        </Button>
      </div>
    </main>
  );
}
