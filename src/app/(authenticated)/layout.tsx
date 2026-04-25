import { requireSession } from "@/lib/auth/server";

/**
 * Layout partagé pour toutes les routes protégées.
 * requireSession() redirige vers /login si la session est absente.
 * Les pages enfants peuvent ré-appeler requireSession() pour obtenir
 * l'objet session — Better Auth le met en cache au niveau de la requête.
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return <>{children}</>;
}
