import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YobbuGo — Administration",
  robots: "noindex, nofollow",
};

/** Espace maintenance séparé : pas le même header que l'app utilisateurs. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f1c1e] text-white">
      <header className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <div className="font-extrabold text-lg">
          YobbuGo <span className="text-[#f5c65d]">Admin</span>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="hover:underline text-[#f5c65d]">
            Maintenance
          </Link>
          <Link href="/" className="hover:underline opacity-70">
            Retour site
          </Link>
        </nav>
      </header>
      <div className="max-w-5xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
