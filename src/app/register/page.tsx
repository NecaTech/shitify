import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Créer un compte" };

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Créer un compte
        </h1>
        <RegisterForm />
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-foreground underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
