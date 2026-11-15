"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TransporterCard } from "@/components/TransporterCard";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppRole } from "@/lib/roles";
import { canSeeLocalOffers, canSeeSeekLocal } from "@/lib/visibility";

type LocalAd = {
  id: number;
  name: string;
  zone: string;
  district: string;
  price: string;
};

type Seek = {
  id: number;
  origin: string;
  destination: string;
  desired_time: string;
  details: string;
  author: string;
};

export default function LocalPage() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [all, setAll] = useState<LocalAd[]>([]);
  const [results, setResults] = useState<LocalAd[]>([]);
  const [seeks, setSeeks] = useState<Seek[]>([]);
  const [role, setRole] = useState<AppRole | null>(null);
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let userRole: AppRole | null = null;
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .limit(1);
        userRole = (roles?.[0]?.role as AppRole) || null;
        if (!userRole) userRole = localStorage.getItem("yobbugo_role") as AppRole | null;
      }
      setRole(userRole);

      if (canSeeLocalOffers(userRole)) {
        const { data, error: qErr } = await supabase
          .from("local_availabilities")
          .select("id, location, district, price_label, status, transporter_id")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (qErr) setError(qErr.message);
        else {
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
        }
      }

      if (canSeeSeekLocal(userRole)) {
        const { data: seekData } = await supabase
          .from("seek_posts")
          .select("id, origin, destination, desired_time, details, author_id")
          .eq("kind", "tiak_tiak")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        const authorIds = [...new Set((seekData || []).map(s => s.author_id).filter(Boolean))];
        const names: Record<string, string> = {};
        if (authorIds.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", authorIds);
          profiles?.forEach(p => {
            if (p.display_name) names[p.id] = p.display_name;
          });
        }
        setSeeks(
          (seekData || []).map(s => ({
            id: Number(s.id),
            origin: s.origin || "",
            destination: s.destination || "",
            desired_time: s.desired_time || "",
            details: s.details || "",
            author: names[s.author_id as string] || "Client",
          }))
        );
      }

      setLoading(false);
    }
    load();
  }, []);

  function search() {
    setResults(
      all.filter(t => {
        const cityOk = !city || t.zone.toLowerCase().includes(city.toLowerCase());
        const dOk =
          !district || `${t.zone} ${t.district}`.toLowerCase().includes(district.toLowerCase());
        return cityOk && dOk;
      })
    );
  }

  const showOffers = canSeeLocalOffers(role);
  const showSeeks = canSeeSeekLocal(role);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Livraison locale — Tiak-Tiak</h1>
      {role === "tiak_tiak" && (
        <p className="text-sm text-[#698084] mb-4">
          En tant que Tiak-Tiak, tu vois les demandes clients (pas les offres des autres Tiak-Tiak).
        </p>
      )}

      {showOffers && (
        <>
          <div className="bg-white border border-[#e1e9e8] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Ville</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Dakar, Thiès…" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Quartier / zone</label>
              <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Plateau, Yoff…" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
            </div>
            <div className="flex items-end">
              <button onClick={search} className="w-full bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3">Rechercher</button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Offres Tiak-Tiak</h2>
            <span className="text-sm text-[#698084]">{loading ? "…" : `${results.length} résultat(s)`}</span>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {loading ? (
              <div className="col-span-full text-center text-[#698084]">Chargement…</div>
            ) : results.length === 0 ? (
              <div className="col-span-full text-center bg-white p-8 rounded-2xl">Aucune disponibilité pour le moment.</div>
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
                      📍 {t.zone}<br />
                      🗺️ {t.district}
                    </>
                  }
                />
              ))
            )}
          </div>
        </>
      )}

      {showSeeks && (
        <div>
          <h2 className="text-xl font-bold mb-4">Clients qui cherchent un Tiak-Tiak</h2>
          {seeks.length === 0 ? (
            <p className="text-sm text-[#698084]">Aucune demande pour le moment.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {seeks.map(s => (
                <article key={s.id} className="bg-white border border-[#e0e9e7] rounded-2xl p-5">
                  <div className="font-bold">{s.author}</div>
                  <div className="text-sm mt-2">📍 {s.origin} → {s.destination}</div>
                  <div className="text-sm text-[#698084]">🕐 Créneau : {s.desired_time || "À préciser"}</div>
                  {s.details && <p className="text-sm mt-2">{s.details}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {(role === "particulier" || role === "commercant") && (
        <p className="mt-8 text-sm">
          <Link href="/chercher" className="text-[#176c64] font-semibold underline">
            Publier « Je cherche un Tiak-Tiak »
          </Link>
        </p>
      )}
    </div>
  );
}
