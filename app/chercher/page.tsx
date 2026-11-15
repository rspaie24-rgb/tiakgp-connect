"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppRole } from "@/lib/roles";
import { canPostSeek } from "@/lib/visibility";

export default function ChercherPage() {
  const router = useRouter();
  const [kind, setKind] = useState<"gp" | "tiak_tiak">("gp");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [desiredTime, setDesiredTime] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function check() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1);
      const role = (roles?.[0]?.role as AppRole) || (localStorage.getItem("yobbugo_role") as AppRole);
      if (!canPostSeek(role)) {
        setMessage("Réservé aux profils Personnel et Commerçant.");
        setAllowed(false);
      } else {
        setAllowed(true);
      }
    }
    check();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setOk(false);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: user.user_metadata?.full_name || "Client",
      });

      const { error } = await supabase.from("seek_posts").insert({
        author_id: user.id,
        kind,
        origin: origin.trim(),
        destination: destination.trim(),
        desired_date: kind === "gp" ? desiredDate || null : null,
        desired_time: kind === "tiak_tiak" ? desiredTime.trim() || null : null,
        details: details.trim() || null,
        status: "active",
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setOk(true);
      setMessage(
        kind === "gp"
          ? "Demande publiée — visible par les GP."
          : "Demande publiée — visible par les Tiak-Tiak."
      );
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Je cherche un transporteur</h1>
      <p className="text-sm text-[#698084] mb-6">
        Personnel et commerçants : publiez une demande. Les GP voient les demandes GP ; les Tiak-Tiak
        voient les demandes locales.
      </p>

      {!allowed && message && <p className="text-red-600 text-sm">{message}</p>}

      {allowed && (
        <form onSubmit={submit} className="bg-white border border-[#e1e9e8] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">Type</label>
            <select
              value={kind}
              onChange={e => setKind(e.target.value as "gp" | "tiak_tiak")}
              className="w-full border border-[#d3e0dd] rounded-lg p-3"
            >
              <option value="gp">Je cherche un GP (date)</option>
              <option value="tiak_tiak">Je cherche un Tiak-Tiak (horaire)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Départ / collecte</label>
            <input required value={origin} onChange={e => setOrigin(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Destination</label>
            <input required value={destination} onChange={e => setDestination(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3" />
          </div>
          {kind === "gp" ? (
            <div>
              <label className="block text-xs font-bold mb-1">Date souhaitée</label>
              <input type="date" value={desiredDate} onChange={e => setDesiredDate(e.target.value)} className="w-full border border-[#d3e0dd] rounded-lg p-3" />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold mb-1">Horaire souhaité</label>
              <input
                value={desiredTime}
                onChange={e => setDesiredTime(e.target.value)}
                placeholder="Ex. demain 14h, ce soir…"
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold mb-1">Détails du colis</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} className="w-full border border-[#d3e0dd] rounded-lg p-3" />
          </div>
          <button type="submit" disabled={loading} className="bg-[#efbb45] text-[#243234] font-bold rounded-xl px-6 py-3 disabled:opacity-60">
            {loading ? "…" : "Publier ma demande"}
          </button>
        </form>
      )}

      {message && allowed && (
        <p className={`mt-4 text-sm ${ok ? "text-green-700" : "text-red-700"}`}>{message}</p>
      )}

      <p className="mt-6 text-sm">
        <Link href="/dashboard" className="underline text-[#176c64]">
          Mon compte
        </Link>
      </p>
    </div>
  );
}
