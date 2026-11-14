import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TiakGP Connect",
  description: "Marketplace de transport de colis — Tiak-Tiak local et GP international",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <header className="bg-[#103c40] text-white px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-2xl">
            Tiak<span className="text-[#f5c65d]">GP</span> Connect
          </Link>
          <nav className="flex gap-4 text-sm flex-wrap">
            <Link href="/local" className="hover:underline">Local</Link>
            <Link href="/gp" className="hover:underline">GP</Link>
            <Link href="/publish" className="hover:underline">Publier</Link>
            <Link href="/dashboard" className="hover:underline">Tableau de bord</Link>
            <Link href="/admin" className="hover:underline font-semibold text-[#f5c65d]">Admin</Link>
            <Link href="/login" className="hover:underline">Connexion</Link>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
