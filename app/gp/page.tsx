"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TransporterCard } from "@/components/TransporterCard";
import { SeekCta } from "@/components/SeekCta";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppRole } from "@/lib/roles";
import { canSeeGpOffers, canSeeSeekGp } from "@/lib/visibility";

type Trip = {
  id: number;
  name: string;
  from: string;
  to: string;
  depart: string;
  capacity: string;
  price: string;
};

type Seek = {
  id: number;
  origin: string;
  destination: string;
  desired_date: string;
  details: string;
  author: string;
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
        if (!userRole) {
          const local = localStorage.getItem("yobbugo_role") as AppRole | null;
          userRole = local;
        }
      }
      setRole(userRole);

      if (canSeeGpOffers(userRole)) {
        const { data, error: qErr } = await supabase
          .from("gp_trips")
          .select(
            "id, origin_city, destination_city, departure_at, capacity_kg, price_label, status, transporter_id"
          )
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
        }
      }

      if (canSeeSeekGp(userRole)) {
        const { data: seekData } = await supabase
          .from("seek_posts")
          .select("id, origin, destination, desired_date, details, author_id")
          .eq("kind", "gp")
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
            desired_date: s.desired_date || "",
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
        const fromOk = !from || t.from.toLowerCase().includes(from.toLowerCase());
        const toOk = !to || t.to.toLowerCase().includes(to.toLowerCase());
        const dateOk = !date || !t.depart || t.depart >= date;
        return fromOk && toOk && dateOk;
      })
    );
  }

  const showOffers = canSeeGpOffers(role);
  const showSeeks = canSeeSeekGp(role);
  const isClient = role === "particulier" || role === "commercant" || role === null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">GP international</h1>
      {role === "gp" && (
        <p className="text-sm text-[#698084] mb-4">
          En tant que GP, tu vois les demandes des clients qui cherchent un GP (pas les offres des autres GP).
        </p>
      )}

      {showOffers && (
        <>
          <div className="bg-white border border-[#e1e9e8] rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Ville de départ</label>
              <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Dakar, Paris…" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Destination</label>
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="Paris…" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
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
            <h2 className="text-xl font-bold">Offres GP</h2>
            <span className="text-sm text-[#698084]">{loading ? "…" : `${results.length} résultat(s)`}</span>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {loading ? (
              <div className="col-span-full text-center text-[#698084]">Chargement…</div>
            ) : results.length === 0 ? (
              <div className="col-span-full text-center bg-white p-8 rounded-2xl">Aucune offre GP pour ces critères.</div>
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
                      🌍 {t.from} → {t.to}<br />
                      🛫 Départ : {formatDate(t.depart)}<br />
                      📦 Capacité : {t.capacity}
                    </>
                  }
                />
              ))
            )}
          </div>

          {isClient && <SeekCta kind="gp" />}
        </>
      )}

      {showSeeks && (
        <div>
          <h2 className="text-xl font-bold mb-4">Clients qui cherchent un GP</h2>
          {seeks.length === 0 ? (
            <p className="text-sm text-[#698084]">Aucune demande pour le moment.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {seeks.map(s => (
                <article key={s.id} className="bg-white border border-[#e0e9e7] rounded-2xl p-5">
                  <div className="font-bold">{s.author}</div>
                  <div className="text-sm mt-2">🌍 {s.origin} → {s.destination}</div>
                  <div className="text-sm text-[#698084]">📅 Date souhaitée : {formatDate(s.desired_date)}</div>
                  {s.details && <p className="text-sm mt-2">{s.details}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {!showOffers && !showSeeks && !loading && (
        <p className="text-[#698084]">Rien à afficher pour ton profil sur cette page.</p>
      )}
    </div>
  );
}
