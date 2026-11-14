"use client";

import { useState } from "react";

export default function PublishPage() {
  const [type, setType] = useState("local");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form);
    setMessage(`Annonce ${type} publiée (démo) : ${JSON.stringify(data, null, 2)}`);
    // TODO: insert into Supabase
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Publier une disponibilité</h1>
      <p className="text-sm text-[#698084] mb-6">Créez une annonce fictive (persistance à venir avec Supabase).</p>

      <form onSubmit={handleSubmit} className="bg-white border border-[#e1e9e8] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-bold mb-1">Type</label>
          <select name="type" value={type} onChange={e => setType(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3">
            <option value="local">Tiak-Tiak</option>
            <option value="gp">GP international</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Nom affiché</label>
          <input name="name" required placeholder="Votre nom" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Ville de départ / zone</label>
          <input name="from" required placeholder="Dakar" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Destination / quartier</label>
          <input name="to" required placeholder="Paris ou Plateau" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Tarif indicatif</label>
          <input name="price" required placeholder="Ex. 2 000 FCFA" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        {type === "gp" && (
          <div>
            <label className="block text-xs font-bold mb-1">Date de départ</label>
            <input name="depart" type="date" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
          </div>
        )}
        <div className="md:col-span-2">
          <button type="submit" className="bg-[#efbb45] text-[#243234] font-bold rounded-xl px-6 py-3">
            Publier l'annonce
          </button>
        </div>
      </form>

      {message && <pre className="mt-6 bg-white p-4 rounded-xl text-sm overflow-auto">{message}</pre>}
    </div>
  );
}
