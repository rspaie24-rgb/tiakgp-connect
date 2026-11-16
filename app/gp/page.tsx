"use client";

import { useEffect, useState } from "react";
import { TransporterCard } from "@/components/TransporterCard";
import { SeekCta } from "@/components/SeekCta";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppRole } from "@/lib/roles";
import { canSeeGpOffers, canSeeSeekGp } from "@/lib/visibility";
import { registerContactClick } from "@/lib/seek-contact";
import { whatsappLink, telLink } from "@/lib/contact";

type Trip = {
  id: number;
  name: string;
  from: string;
  to: string;
  depart: string;
  capacity: string;
  price: string;
  transporterId: string;
  whatsappUrl: string | null;
};

type Seek = {
  id: number;
  origin: string;
  destination: string;
  desired_date: string;
  details: string;
  author: string;
  phone: string | null;
  authorId: string;
  contact_count: number;
};

const SUGGESTED_CITIES = [
  "Dakar",
  "Paris",
  "Casablanca",
  "Rabat",
  "Dubaï",
  "Abu Dhabi",
  "Istanbul",
  "Ankara",
  "Guangzhou",
  "Beijing",
  "Shanghai",
  "Lyon",
  "Marseille",
];

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
  const [me, setMe] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setError("");
      setReady(false);

      if (!isSupabaseConfigured()) {
        setError("Service indisponible");
        setReady(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) setMe(user.id);

      let userRole: AppRole | null = null;
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .limit(1);
        userRole = (roles?.[0]?.role as AppRole) || null;
        if (!userRole) {
          userRole = localStorage.getItem("yobbugo_role") as AppRole | null;
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

        if (qErr) {
          setError(qErr.message);
        } else {
          const ids = [...new Set((data || []).map(r => r.transporter_id).filter(Boolean))];
          const nameById: Record<string, string> = {};
          const whatsappById: Record<string, string> = {};
          if (ids.length) {
            const [{ data: profiles }, { data: contacts }] = await Promise.all([
              supabase.rpc("public_profile_cards", { p_ids: ids }),
              supabase.rpc("transporter_whatsapp_contacts", { p_ids: ids }),
            ]);
            profiles?.forEach((p: { id: string; display_name: string | null }) => {
              if (p.display_name) nameById[p.id] = p.display_name;
            });
            contacts?.forEach((contact: { user_id: string; whatsapp_e164: string }) => {
              const link = whatsappLink(contact.whatsapp_e164, "Bonjour, je vous contacte via YobbuGo concernant votre trajet GP.");
              if (link) whatsappById[contact.user_id] = link;
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
            transporterId: row.transporter_id as string,
            whatsappUrl: whatsappById[row.transporter_id as string] || null,
          }));
          setAll(mapped);
          setResults(mapped);
        }
      }

      if (canSeeSeekGp(userRole)) {
        const { data: seekData, error: seekErr } = await supabase
          .from("seek_posts")
          .select("id, origin, destination, desired_date, details, author_id, contact_count")
          .eq("kind", "gp")
          .eq("status", "active")
          .lt("contact_count", 5)
          .order("created_at", { ascending: false });

        if (seekErr) {
          console.warn("seek_posts", seekErr.message);
        } else {
          const authorIds = [...new Set((seekData || []).map(s => s.author_id).filter(Boolean))];
          const profilesById: Record<string, { name: string }> = {};
          if (authorIds.length) {
            const { data: profiles } = await supabase.rpc("public_profile_cards", { p_ids: authorIds });
            profiles?.forEach((p: { id: string; display_name: string | null }) => {
              profilesById[p.id] = {
                name: p.display_name || "Client",
              };
            });
          }
          setSeeks(
            (seekData || []).map(s => ({
              id: Number(s.id),
              origin: s.origin || "",
              destination: s.destination || "",
              desired_date: s.desired_date || "",
              details: s.details || "",
              author: profilesById[s.author_id as string]?.name || "Client",
              authorId: s.author_id as string,
              phone: null,
              contact_count: s.contact_count || 0,
            }))
          );
        }
      }

      setReady(true);
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

  async function onContact(seekId: number) {
    if (!me) return;
    const res = await registerContactClick(seekId, me);
    if (res.hidden) {
      setSeeks(prev => prev.filter(s => s.id !== seekId));
    } else if (res.count) {
      setSeeks(prev =>
        prev.map(s => (s.id === seekId ? { ...s, contact_count: res.count! } : s))
      );
    }
  }

  const showOffers = ready && canSeeGpOffers(role);
  const showSeeks = ready && canSeeSeekGp(role);
  const isClient = role === "particulier" || role === "commercant" || (!role && ready);

  if (!ready) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">GP international</h1>
        <p className="text-[#698084]">Chargement…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">GP international</h1>
      <p className="text-sm text-[#698084] mb-4">
        Sénégal · France · Maroc · Chine · Dubaï · Turquie
      </p>

      {role === "gp" && (
        <p className="text-sm text-[#698084] mb-4">
          En tant que GP, tu vois les demandes des clients qui cherchent un GP (pas les offres des
          autres GP).
        </p>
      )}

      {showOffers && (
        <>
          <div className="bg-white border border-[#e1e9e8] rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Ville de départ</label>
              <input
                value={from}
                onChange={e => setFrom(e.target.value)}
                list="cities-from"
                placeholder="Dakar, Paris, Casablanca, Dubaï…"
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
              <datalist id="cities-from">
                {SUGGESTED_CITIES.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Destination</label>
              <input
                value={to}
                onChange={e => setTo(e.target.value)}
                list="cities-to"
                placeholder="Paris, Istanbul, Guangzhou…"
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
              <datalist id="cities-to">
                {SUGGESTED_CITIES.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Départ à partir du</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={search}
                className="w-full bg-[#efbb45] text-[#243234] font-bold rounded-xl py-3"
              >
                Rechercher
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {SUGGESTED_CITIES.slice(0, 8).map(c => (
              <button
                key={c}
                onClick={() => {
                  setTo(c);
                  setResults(all.filter(t => t.to.toLowerCase().includes(c.toLowerCase())));
                }}
                className="text-xs bg-[#e3f6e8] text-[#23754a] px-3 py-1 rounded-full"
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Offres GP</h2>
            <span className="text-sm text-[#698084]">{results.length} résultat(s)</span>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {results.length === 0 ? (
              <div className="col-span-full text-center bg-white p-8 rounded-2xl">
                Aucune offre GP pour ces critères.
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
                  whatsappUrl={t.whatsappUrl}
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
              {seeks.map(s => {
                const wa = whatsappLink(s.phone, `Bonjour ${s.author}, je vous contacte via YobbuGo.`);
                const tel = telLink(s.phone);
                return (
                  <article key={s.id} className="bg-white border border-[#e0e9e7] rounded-2xl p-5">
                    <div className="font-bold">{s.author}</div>
                    <div className="text-sm mt-2">🌍 {s.origin} → {s.destination}</div>
                    <div className="text-sm text-[#698084]">
                      📅 Date souhaitée : {formatDate(s.desired_date)}
                    </div>
                    {s.details && <p className="text-sm mt-2">{s.details}</p>}
                    <div className="text-xs text-[#698084] mt-1">
                      Contacts : {s.contact_count}/5
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      {tel && (
                        <a
                          href={tel}
                          onClick={() => onContact(s.id)}
                          className="text-[#176c64] font-semibold"
                        >
                          📞 Appeler
                        </a>
                      )}
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onContact(s.id)}
                          className="text-[#25d366] font-semibold"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!showOffers && !showSeeks && (
        <p className="text-[#698084]">Rien à afficher pour ton profil sur cette page.</p>
      )}
    </div>
  );
}
