"use client";

import { useState } from "react";
import { localTransporters, type LocalTransporter } from "@/lib/mock-data";
import { TransporterCard } from "@/components/TransporterCard";

export default function LocalPage() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [availability, setAvailability] = useState("yes");
  const [results, setResults] = useState<LocalTransporter[]>(localTransporters.filter(t => t.available));

  function search() {
    const filtered = localTransporters.filter(t => {
      const cityOk = !city || t.zone === city;
      const districtOk = !district || `${t.coverage} ${t.district}`.toLowerCase().includes(district.toLowerCase());
      const availOk = availability === "all" || t.available;
      return cityOk && districtOk && availOk;
    });
    setResults(filtered);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Livraison locale — Tiak-Tiak</h1>

      <div className="bg-white border border-[#e1e9e8] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">Ville</label>
          <select value={city} onChange={e => setCity(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3">
            <option value="">Toutes les villes</option>
            <option>Dakar</option>
            <option>Thiès</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Quartier / zone</label>
          <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Ex. Plateau, Yoff…" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Disponibilité</label>
          <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3">
            <option value="yes">Disponibles maintenant</option>
            <option value="all">Tous les profils</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={search} className="w-full bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3">Rechercher</button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tiak-Tiak disponibles</h2>
        <span className="text-sm text-[#698084]">{results.length} résultat(s)</span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.length === 0 ? (
          <div className="col-span-full text-center bg-white p-8 rounded-2xl">Aucun transporteur ne correspond aux filtres.</div>
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
              icon="🛵"
              details={
                <>
                  📍 {t.zone} — {t.district}<br />
                  🗺️ {t.coverage}
                </>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
