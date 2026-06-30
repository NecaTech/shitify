export type DatabaseUrlKind =
  | "local"
  | "remote"
  | "production-suspect"
  | "unknown";

export function classifyDatabaseUrl(url: URL): DatabaseUrlKind {
  const text = `${url.hostname} ${url.pathname} ${url.username}`.toLowerCase();

  if (
    ["localhost", "127.0.0.1", "::1", "postgres", "db"].includes(url.hostname)
  ) {
    return "local";
  }

  if (
    text.includes("prod") ||
    text.includes("production") ||
    text.includes("live")
  ) {
    return "production-suspect";
  }

  if (text.includes("neon.tech") || text.includes("neon")) {
    return "remote";
  }

  return "unknown";
}
