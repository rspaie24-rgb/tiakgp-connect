import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: "YobbuGo",
  description: "Marketplace de transport de colis — Tiak-Tiak local et GP international",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YobbuGo",
  },
};

export const viewport: Viewport = {
  themeColor: "#103c40",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased flex flex-col">
        <header className="bg-[#103c40] text-white px-5 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo className="w-9 h-9" />
            <span className="font-extrabold text-2xl tracking-tight">
              Yobbu<span className="text-[#f5c65d]">Go</span>
            </span>
          </Link>
          <nav className="flex gap-3 sm:gap-4 text-sm flex-wrap justify-end">
            <Link href="/local" className="hover:underline">Local</Link>
            <Link href="/gp" className="hover:underline">GP</Link>
            <Link href="/chercher" className="hover:underline">Je cherche</Link>
            <Link href="/publish" className="hover:underline">Publier</Link>
            <Link href="/dashboard" className="hover:underline">Mon compte</Link>
            <Link href="/login" className="hover:underline">Connexion</Link>
          </nav>
        </header>

        <main className="max-w-5xl mx-auto px-5 py-8 flex-1 w-full">{children}</main>

        <footer className="border-t border-[#e0e9e7] bg-white py-6 px-5 text-center text-sm text-[#698084]">
          <div className="flex flex-wrap justify-center gap-4 mb-2">
            <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
            <Link href="/cgu" className="hover:underline">CGU</Link>
            <a href="mailto:rspaie24@gmail.com" className="hover:underline">Contact</a>
          </div>
          <p>© {new Date().getFullYear()} YobbuGo — Astou. Paiement direct client ↔ transporteur.</p>
        </footer>

        <InstallPrompt />
      </body>
    </html>
  );
}
