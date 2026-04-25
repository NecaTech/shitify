export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground mt-2">
          La page que vous cherchez n&apos;existe pas.
        </p>
      </div>
    </main>
  );
}
