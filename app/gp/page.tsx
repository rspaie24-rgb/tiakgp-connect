"use client";

import { useState } from "react";
import { gpTrips, type GpTrip } from "@/lib/mock-data";
import { TransporterCard } from "@/components/TransporterCard";

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function GpPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<GpTrip[]>(gpTrips);

  function search() {
    const filtered = gpTrips.filter(t => {
      const fromOk = !from || t.from === from;
      const toOk = !to || t.to === to;
      const dateOk = !date || t.depart >= date;
      return fromOk && toOk && dateOk;
    });
    setResults(filtered);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">GP international</h1>

      <div className="bg-white border border-[#e1e9e8] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Ville de départ</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3">
            <option value="">Toutes</option>
            <option>Paris</option>
            <option>Dakar</option>
            <option>Lyon</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Destination</label>
          <select value={to} onChange={e => setTo(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3">
            <option value="">Toutes</option>
            <option>Dakar</option>
            <option>Paris</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Départ à partir du</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        <div className="flex items-end">
          <button onClick={search} className="w-full bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3">Rechercher</button>
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
              key={t.id}
              id={t.id}
              name={t.name}
              rating={t.rating}
              reviews={t.reviews}
              available={t.available}
              price={t.price}
              icon="✈️"
              details={
                <>
                  🌍 {t.from} → {t.to}<br />
                  🛫 Départ : {formatDate(t.depart)}<br />
                  🛬 Arrivée : {formatDate(t.arrive)}<br />
                  🔁 Retour : {t.returnDate === "À préciser" ? t.returnDate : formatDate(t.returnDate)}<br />
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
