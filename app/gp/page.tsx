"use client";

import { useEffect, useState } from "react";
import { TransporterCard } from "@/components/TransporterCard";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Trip = {
  id: number;
  name: string;
  from: string;
  to: string;
  depart: string;
  capacity: string;
  price: string;
};

function formatDate(d: string) {
  if (!d) return "À préciser";
  try {
    return new Date(d.includes("T") ? d : d + "T12:00:00").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function GpPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [all, setAll] = useState<Trip[]>([]);
  const [results, setResults] = useState<Trip[]>([]);
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
        .from("gp_trips")
        .select(
          "id, origin_city, destination_city, departure_at, capacity_kg, price_label, status, transporter_id"
        )
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

      const mapped: Trip[] = (data || []).map(row => ({
        id: Number(row.id),
        name: nameById[row.transporter_id as string] || "GP YobbuGo",
        from: row.origin_city || "",
        to: row.destination_city || "",
        depart: row.departure_at || "",
        capacity: row.capacity_kg != null ? `${row.capacity_kg} kg` : "À préciser",
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
        const fromOk = !from || t.from.toLowerCase().includes(from.toLowerCase());
        const toOk = !to || t.to.toLowerCase().includes(to.toLowerCase());
        const dateOk = !date || !t.depart || t.depart >= date;
        return fromOk && toOk && dateOk;
      })
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">GP international</h1>

      <div className="bg-white border border-[#e1e9e8] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Ville de départ</label>
          <input
            value={from}
            onChange={e => setFrom(e.target.value)}
            placeholder="Ex. Dakar, Paris…"
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Destination</label>
          <input
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="Ex. Paris…"
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Départ à partir du</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        <div className="flex items-end">
          <button onClick={search} className="w-full bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3">
            Rechercher
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trajets disponibles</h2>
        <span className="text-sm text-[#698084]">{loading ? "…" : `${results.length} résultat(s)`}</span>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-[#698084]">Chargement…</div>
        ) : results.length === 0 ? (
          <div className="col-span-full text-center bg-white p-8 rounded-2xl">
            Aucun trajet publié pour le moment.
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
              icon="✈️"
              details={
                <>
                  🌍 {t.from} → {t.to}
                  <br />
                  🛫 Départ : {formatDate(t.depart)}
                  <br />
                  📦 Capacité : {t.capacity}
                </>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
