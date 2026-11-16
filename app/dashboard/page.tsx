"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ROLE_LABELS, isTransporter, type AppRole } from "@/lib/roles";
import { TransporterContactSettings } from "@/components/TransporterContactSettings";

type MyAd = {
  id: number;
  kind: "gp" | "local";
  title: string;
  price: string;
  status: string;
  extra?: string;
};

type MySeek = {
  id: number;
  kind: string;
  title: string;
  status: string;
  contact_count: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<AppRole | null>(null);
  const [name, setName] = useState("");
  const [ads, setAds] = useState<MyAd[]>([]);
  const [seeks, setSeeks] = useState<MySeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [adsError, setAdsError] = useState("");

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        const r = (localStorage.getItem("yobbugo_role") as AppRole) || null;
        if (!r) {
          router.replace("/onboarding");
          return;
        }
        setRole(r);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setName(
        (user.user_metadata?.full_name as string) ||
          user.user_metadata?.phone ||
          "Utilisateur"
      );

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1);

      const r =
        (roles?.[0]?.role as AppRole) ||
        (localStorage.getItem("yobbugo_role") as AppRole) ||
        null;
      if (!r) {
        router.replace("/onboarding");
        return;
      }
      setRole(r);

      const list: MyAd[] = [];
      const { data: gps, error: gpErr } = await supabase
        .from("gp_trips")
        .select("id, origin_city, destination_city, departure_at, capacity_kg, price_label, status")
        .eq("transporter_id", user.id)
        .order("created_at", { ascending: false });

      if (gpErr) setAdsError(gpErr.message);
      gps?.forEach(row => {
        list.push({
          id: Number(row.id),
          kind: "gp",
          title: `${row.origin_city || "?"} → ${row.destination_city || "?"}`,
          price: row.price_label || "À convenir",
          status: row.status || "active",
          extra: [
            row.departure_at ? `Départ : ${row.departure_at}` : null,
            row.capacity_kg != null ? `Capacité : ${row.capacity_kg} kg` : null,
          ]
            .filter(Boolean)
            .join(" · "),
        });
      });

      const { data: locals, error: localErr } = await supabase
        .from("local_availabilities")
        .select("id, location, district, price_label, status")
        .eq("transporter_id", user.id)
        .order("created_at", { ascending: false });

      if (localErr) setAdsError(previous => previous || localErr.message);
      locals?.forEach(row => {
        list.push({
          id: Number(row.id),
          kind: "local",
          title: `${row.location || "?"} — ${row.district || ""}`,
          price: row.price_label || "À convenir",
          status: row.status || "active",
        });
      });

      setAds(list);

      const { data: mySeeks } = await supabase
        .from("seek_posts")
        .select("id, kind, origin, destination, status, contact_count")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      setSeeks(
        (mySeeks || []).map(s => ({
          id: Number(s.id),
          kind: s.kind || "",
          title: `${s.origin || "?"} → ${s.destination || "?"}`,
          status: s.status || "active",
          contact_count: s.contact_count || 0,
        }))
      );

      setLoading(false);
    }
    load();
  }, [router]);

  async function updateSeek(id: number, status: string, resetCount = false) {
    const supabase = createClient();
    const updates: { status: string; contact_count?: number } = { status };
    if (resetCount) updates.contact_count = 0;
    await supabase.from("seek_posts").update(updates).eq("id", id);
    setSeeks(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status, contact_count: resetCount ? 0 : s.contact_count }
          : s
      )
    );
  }

  if (loading) {
    return <p className="text-center text-[#698084]">Chargement…</p>;
  }

  const transporter = isTransporter(role);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mon compte YobbuGo</h1>
      <p className="text-[#698084] mb-6">
        {name && <span className="font-semibold text-[#132a35]">{name}</span>}
        {role && (
          <>
            {" · "}
            <span className="inline-block bg-[#e3f6e8] text-[#23754a] text-xs font-bold px-2 py-1 rounded-full">
              {ROLE_LABELS[role]}
            </span>
          </>
        )}
      </p>
      <p className="mb-6 text-sm">
        <Link href="/compte" className="text-[#176c64] underline">Gérer mes données et mon compte</Link>
      </p>

      {transporter ? (
        <div className="space-y-6">
          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-2">Espace transporteur</h2>
            <p className="text-sm text-[#425d61] mb-4">
              Publie et mets à jour tes disponibilités. Le paiement du colis reste direct avec le client.
            </p>
            <Link
              href="/publish"
              className="inline-block bg-[#efbb45] text-[#243234] font-bold rounded-xl px-6 py-3"
            >
              + Publier une annonce
            </Link>
          </div>
          <TransporterContactSettings />

          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold mb-4">Mes annonces ({ads.length})</h2>
            {adsError && <p className="text-sm text-red-600 mb-3">{adsError}</p>}
            {ads.length === 0 ? (
              <p className="text-sm text-[#698084]">
                Aucune annonce.{" "}
                <Link href="/publish" className="underline text-[#176c64]">
                  Publier maintenant
                </Link>
              </p>
            ) : (
              <ul className="space-y-3">
                {ads.map(ad => (
                  <li
                    key={`${ad.kind}-${ad.id}`}
                    className="border border-[#e0e9e7] rounded-xl p-4 flex flex-wrap justify-between gap-3 items-center"
                  >
                    <div>
                      <span className="text-xs font-bold uppercase text-[#698084]">
                        {ad.kind === "gp" ? "✈️ GP" : "🛵 Tiak-Tiak"}
                      </span>
                      <div className="font-semibold">{ad.title}</div>
                      {ad.extra && (
                        <div className="text-sm text-[#698084]">{ad.extra}</div>
                      )}
                      <div className="text-sm font-bold text-[#155e58] mt-1">{ad.price}</div>
                      <div className="text-xs text-[#23754a]">{ad.status}</div>
                    </div>
                    <Link
                      href={`/annonces/${ad.kind}/${ad.id}`}
                      className="bg-[#176c64] text-white text-sm font-semibold rounded-lg px-4 py-2"
                    >
                      Modifier
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-2">Que cherches-tu ?</h2>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/local" className="bg-[#176c64] text-white font-semibold rounded-xl px-5 py-3">
                🛵 Tiak-Tiak
              </Link>
              <Link href="/gp" className="bg-[#176c64] text-white font-semibold rounded-xl px-5 py-3">
                ✈️ GP
              </Link>
              <Link href="/chercher" className="bg-[#efbb45] text-[#243234] font-semibold rounded-xl px-5 py-3">
                + Publier une demande
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold mb-4">Mes demandes ({seeks.length})</h2>
            {seeks.length === 0 ? (
              <p className="text-sm text-[#698084]">Aucune demande pour le moment.</p>
            ) : (
              <ul className="space-y-3">
                {seeks.map(s => (
                  <li
                    key={s.id}
                    className="border border-[#e0e9e7] rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase text-[#698084]">
                          {s.kind === "gp" ? "✈️ GP" : "🛵 Tiak"}
                        </span>
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-xs text-[#698084] mt-1">
                          Contacts : {s.contact_count}/5 · Statut : {s.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {s.status !== "closed" && (
                        <button
                          onClick={() => updateSeek(s.id, "closed")}
                          className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-lg"
                        >
                          Clôturer (trouvé)
                        </button>
                      )}
                      {(s.status === "hidden" || s.status === "closed") && (
                        <button
                          onClick={() => updateSeek(s.id, "active", true)}
                          className="text-xs bg-[#e3f6e8] text-[#23754a] px-3 py-1 rounded-lg"
                        >
                          Réactiver
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <p className="mt-8 text-center">
        <Link href="/onboarding" className="text-sm text-[#698084] underline">
          Changer de type de profil
        </Link>
      </p>
    </div>
  );
}
