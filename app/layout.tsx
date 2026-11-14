import type { Metadata } from "next";
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
          <div className="font-extrabold text-2xl">
            Tiak<span className="text-[#f5c65d]">GP</span> Connect
          </div>
          <div className="text-xs border border-[#9ab6b3] rounded-full px-3 py-1.5">
            MVP · Prototype
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
