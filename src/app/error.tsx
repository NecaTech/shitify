"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
        <p className="text-muted-foreground mt-2">
          {error.digest
            ? `Référence : ${error.digest}`
            : "Quelque chose s'est mal passé."}
        </p>
        <button
          onClick={reset}
          className="bg-foreground text-background mt-4 rounded px-4 py-2 text-sm"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
