// Voix « chrome » (FR) — l'interface que l'opérateur manipule. Séparée par
// fonction de la voix « performance » (EN, le pitch). Les noms de marque
// (Shitify, Burn my tokens, My Bullshits) restent anglais dans le chrome FR.

const NAV_ITEMS = ["Génération", "Mes Bullshits", "Partage"] as const;

export function ChromeHeader() {
  return (
    <header className="border-brand-void-foreground/15 bg-brand-void/40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="from-brand-neon-pink via-brand-neon-yellow to-brand-neon-mint bg-linear-to-r bg-clip-text text-2xl font-black tracking-tight text-transparent">
          Shitify
        </span>

        <nav
          aria-label="Navigation"
          className="text-brand-void-foreground/70 hidden items-center gap-6 text-sm font-semibold md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              className="hover:text-brand-void-foreground transition"
            >
              {item}
            </span>
          ))}
        </nav>

        <button
          type="button"
          className="from-brand-neon-pink to-brand-neon-yellow text-brand-void shadow-neon-pink rounded-full bg-linear-to-r px-4 py-2 text-sm font-black transition hover:brightness-110"
        >
          Brûler mes tokens 🔥
        </button>
      </div>
    </header>
  );
}
