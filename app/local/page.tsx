"use client";

import { useState } from "react";
import { localTransporters, type LocalTransporter } from "@/lib/mock-data";

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
            <article key={t.id} className="bg-white border border-[#e0e9e7] rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#d9eeea] text-[#12554e] rounded-xl grid place-items-center text-2xl">🛵</div>
                <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <div className="text-sm text-[#698084]">⭐ {t.rating} · {t.reviews} avis</div>
                </div>
              </div>
              <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${t.available ? "bg-[#e3f6e8] text-[#23754a]" : "bg-gray-100 text-gray-500"}`}>
                ● {t.available ? "Disponible" : "Indisponible"}
              </span>
              <div className="text-sm text-[#425d61] leading-relaxed">
                📍 {t.zone} — {t.district}<br />
                🗺️ {t.coverage}
              </div>
              <div className="text-lg font-extrabold text-[#155e58]">{t.price}</div>
              <button disabled={!t.available} className="mt-auto bg-[#176c64] text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
                Demander un transport
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
