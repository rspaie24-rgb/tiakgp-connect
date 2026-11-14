"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        <p>Connectez-vous pour voir vos demandes et annonces.</p>
        <a href="/login" className="inline-block mt-4 bg-[#176c64] text-white px-6 py-3 rounded-xl font-semibold">Se connecter</a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <p className="mb-4">Bienvenue, {user.email}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
          <h2 className="font-bold mb-2">Mes demandes</h2>
          <p className="text-sm text-[#698084]">Aucune demande pour le moment (données réelles à venir).</p>
        </div>
        <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
          <h2 className="font-bold mb-2">Mes annonces</h2>
          <p className="text-sm text-[#698084]">Publiez une disponibilité ou un trajet GP.</p>
          <a href="/publish" className="inline-block mt-3 text-[#176c64] font-semibold">Publier →</a>
        </div>
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
        className="mt-8 text-sm text-red-600 underline"
      >
        Se déconnecter
      </button>
    </div>
  );
}
