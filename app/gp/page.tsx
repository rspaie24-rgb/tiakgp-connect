"use client";

import { useEffect, useState } from "react";
import { gpTrips as mockGp, type GpTrip } from "@/lib/mock-data";
import { TransporterCard } from "@/components/TransporterCard";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
  const [all, setAll] = useState<GpTrip[]>(mockGp);
  const [results, setResults] = useState<GpTrip[]>(mockGp);
  const [source, setSource] = useState("chargement…");

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setSource("démo (Supabase off)");
        return;
      }
      const supabase = createClient();

      // Simple query — no join (avoids PostgREST relation errors)
      const { data, error } = await supabase
        .from("gp_trips")
        .select(
          "id, origin_city, destination_city, departure_at, arrival_at, return_at, capacity_kg, price_label, status, transporter_id"
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        setSource("erreur : " + error.message);
        setAll(mockGp);
        setResults(mockGp);
        return;
      }

      // Optional: fetch names for transporters
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

      const mapped: GpTrip[] = (data || []).map(row => ({
        id: Number(row.id),
        name: nameById[row.transporter_id as string] || "GP YobbuGo",
        from: row.origin_city || "",
        to: row.destination_city || "",
        depart: row.departure_at || "",
        arrive: row.arrival_at || row.departure_at || "",
        returnDate: row.return_at || "À préciser",
        capacity: row.capacity_kg ? `${row.capacity_kg} kg` : "À préciser",
        price: row.price_label || "À convenir",
        rating: "Nouveau",
        reviews: 0,
        available: true,
      }));

      const combined = [...mapped, ...mockGp];
      setAll(combined);
      setResults(combined);
      setSource(
        mapped.length
          ? `${mapped.length} vraie(s) annonce(s) + démo`
          : "0 en base — vérifie Table Editor → gp_trips"
      );
    }
    load();
  }, []);

  function search() {
    const filtered = all.filter(t => {
      const fromOk = !from || t.from.toLowerCase().includes(from.toLowerCase());
      const toOk = !to || t.to.toLowerCase().includes(to.toLowerCase());
      const dateOk = !date || !t.depart || t.depart >= date;
      return fromOk && toOk && dateOk;
    });
    setResults(filtered);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">GP international</h1>
      <p className="text-sm text-[#698084] mb-6">Source : {source}</p>

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
            placeholder="Ex. Paris, Maubeuge…"
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
        <h2 className="text-xl font-bold">GP et prochains trajets</h2>
        <span className="text-sm text-[#698084]">{results.length} résultat(s)</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.length === 0 ? (
          <div className="col-span-full text-center bg-white p-8 rounded-2xl">Aucun trajet ne correspond aux filtres.</div>
        ) : (
          results.map(t => (
            <TransporterCard
              key={`${t.id}-${t.name}`}
              id={t.id}
              name={t.name}
              rating={t.rating}
              reviews={t.reviews}
              available={t.available}
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
