import type { Metadata, Viewport } from "next";
import { env } from "@/lib/env";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "NecaTech App",
    template: "%s · NecaTech",
  },
  description: "Application web construite avec le boilerplate NecaTech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-dvh flex-col">
        {children}
      </body>
    </html>
  );
}
