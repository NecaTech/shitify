import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Connexion
        </h1>
        <LoginForm />
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-foreground underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
