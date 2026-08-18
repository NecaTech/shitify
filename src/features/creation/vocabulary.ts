// Vocabulaire verrouillé de la surface (issue #11 — « Vocabulaire verrouillé »).
//
// Les noms de marque (Shitify, `Burn my tokens`, `My Bullshits`) sont les seuls
// à porter « shit » — jamais la copie du pitch (performance), jamais le chrome.
// La frontière « shit » est structurelle : la provocation est portée par la
// forme et les mécaniques, pas par le lexique.

/**
 * Mots bannis de toute copie de pitch (performance). Correspondance sur mot
 * entier, insensible à la casse. Ne pas y ajouter de termes ambigus qui
 * déclencheraient des faux positifs (« bite », « con », etc.).
 */
export const BANNED_WORDS = [
  "shit",
  "bullshit",
  "shitty",
  "fuck",
  "fucking",
  "motherfucker",
  "asshole",
  "merde",
  "putain",
  "connard",
  "connasse",
  "salope",
  "enculé",
  "enculer",
  "bordel",
] as const;

/** Registre des amplitudes financières imaginaires, choisi par domaine. */
export const VALUATION_POOL = [
  "several billions",
  "multiple billions",
  "a nine-figure number",
  "enough to buy the sky",
] as const;

/**
 * Retourne le mot banni trouvé dans `text`, ou `null`. L'échappement du motif
 * garantit qu'un mot comme « confirmation » ne déclenche pas « con ».
 */
export function findBannedWord(text: string): string | null {
  const normalized = text.normalize("NFKD").toLowerCase();
  for (const word of BANNED_WORDS) {
    const pattern = new RegExp(`(^|[^a-z])${word}([^a-z]|$)`, "i");
    if (pattern.test(normalized)) return word;
  }
  return null;
}
