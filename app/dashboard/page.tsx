"use client";

import Link from "next/link";

const mockRequests = [
  { id: 1, transporter: "Mamadou Ndiaye", status: "envoyée", type: "Local", date: "2026-11-14" },
  { id: 2, transporter: "GP Aminata", status: "acceptée", type: "GP", date: "2026-11-10" },
];

const mockAnnonces = [
  { id: 1, type: "Tiak-Tiak", zone: "Dakar Plateau", price: "1 500 FCFA" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord (démo)</h1>
      <p className="mb-6 text-[#698084]">Version mock — connexion Supabase demain.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
          <h2 className="font-bold mb-4">Mes demandes</h2>
          {mockRequests.map(r => (
            <div key={r.id} className="border-b py-3 last:border-0">
              <div className="font-semibold">{r.transporter}</div>
              <div className="text-sm text-[#698084]">{r.type} · {r.date} · <span className="capitalize">{r.status}</span></div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
          <h2 className="font-bold mb-4">Mes annonces</h2>
          {mockAnnonces.map(a => (
            <div key={a.id} className="border-b py-3 last:border-0">
              <div className="font-semibold">{a.type} — {a.zone}</div>
              <div className="text-sm text-[#155e58] font-bold">{a.price}</div>
            </div>
          ))}
          <Link href="/publish" className="inline-block mt-4 text-[#176c64] font-semibold">+ Publier une annonce</Link>
        </div>
      </div>

      <div className="text-center">
        <Link href="/login" className="text-sm text-[#698084] underline">Connexion (Supabase demain)</Link>
      </div>
    </div>
  );
}
