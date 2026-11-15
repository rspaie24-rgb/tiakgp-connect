"use client";

import { useEffect, useState } from "react";
import { TransporterCard } from "@/components/TransporterCard";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type LocalAd = {
  id: number;
  name: string;
  zone: string;
  district: string;
  price: string;
};

export default function LocalPage() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [all, setAll] = useState<LocalAd[]>([]);
  const [results, setResults] = useState<LocalAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setError("Service indisponible");
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error: qErr } = await supabase
        .from("local_availabilities")
        .select("id, location, district, price_label, status, transporter_id")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (qErr) {
        setError(qErr.message);
        setLoading(false);
        return;
      }

      const ids = [...new Set((data || []).map(r => r.transporter_id).filter(Boolean))];
      const nameById: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", ids);
        profiles?.forEach(p => {
          if (p.display_name) nameById[p.id] = p.display_name;
        });
      }

      const mapped: LocalAd[] = (data || []).map(row => ({
        id: Number(row.id),
        name: nameById[row.transporter_id as string] || "Tiak-Tiak YobbuGo",
        zone: row.location || "",
        district: row.district || "",
        price: row.price_label || "À convenir",
      }));

      setAll(mapped);
      setResults(mapped);
      setLoading(false);
    }
    load();
  }, []);

  function search() {
    setResults(
      all.filter(t => {
        const cityOk = !city || t.zone.toLowerCase().includes(city.toLowerCase());
        const dOk =
          !district ||
          `${t.zone} ${t.district}`.toLowerCase().includes(district.toLowerCase());
        return cityOk && dOk;
      })
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Livraison locale — Tiak-Tiak</h1>

      <div className="bg-white border border-[#e1e9e8] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Ville</label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Ex. Dakar, Thiès…"
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Quartier / zone</label>
          <input
            value={district}
            onChange={e => setDistrict(e.target.value)}
            placeholder="Ex. Plateau, Yoff…"
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <div className="flex items-end">
          <button onClick={search} className="w-full bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3">
            Rechercher
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tiak-Tiak disponibles</h2>
        <span className="text-sm text-[#698084]">{loading ? "…" : `${results.length} résultat(s)`}</span>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-[#698084]">Chargement…</div>
        ) : results.length === 0 ? (
          <div className="col-span-full text-center bg-white p-8 rounded-2xl">
            Aucune disponibilité publiée pour le moment.
          </div>
        ) : (
          results.map(t => (
            <TransporterCard
              key={t.id}
              id={t.id}
              name={t.name}
              rating="—"
              reviews={0}
              available={true}
              price={t.price}
              icon="🛵"
              details={
                <>
                  📍 {t.zone}
                  <br />
                  🗺️ {t.district}
                </>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
