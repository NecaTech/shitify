"use client";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
        <p className="text-muted-foreground mt-2 text-sm">
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
    </div>
  );
}
