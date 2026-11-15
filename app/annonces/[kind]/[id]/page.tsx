"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function errText(err: unknown): string {
  if (!err) return "Erreur";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const o = err as { message?: string };
  return o.message || JSON.stringify(err);
}

export default function EditAnnoncePage() {
  const params = useParams();
  const router = useRouter();
  const kind = String(params.kind || ""); // gp | local
  const id = String(params.id || "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  // GP fields
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [depart, setDepart] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");

  // Local fields
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setMessage("Supabase non configuré");
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

      if (kind === "gp") {
        const { data, error } = await supabase
          .from("gp_trips")
          .select("*")
          .eq("id", id)
          .eq("transporter_id", user.id)
          .maybeSingle();
        if (error || !data) {
          setMessage(error?.message || "Annonce introuvable");
          setLoading(false);
          return;
        }
        setOrigin(data.origin_city || "");
        setDestination(data.destination_city || "");
        setDepart(data.departure_at || "");
        setCapacity(data.capacity_kg != null ? String(data.capacity_kg) : "");
        setPrice(data.price_label || "");
        setStatus(data.status || "active");
      } else if (kind === "local") {
        const { data, error } = await supabase
          .from("local_availabilities")
          .select("*")
          .eq("id", id)
          .eq("transporter_id", user.id)
          .maybeSingle();
        if (error || !data) {
          setMessage(error?.message || "Annonce introuvable");
          setLoading(false);
          return;
        }
        setLocation(data.location || "");
        setDistrict(data.district || "");
        setPrice(data.price_label || "");
        setStatus(data.status || "active");
      } else {
        setMessage("Type d'annonce invalide");
      }
      setLoading(false);
    }
    load();
  }, [kind, id, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
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

      if (kind === "gp") {
        const capacityNum = capacity.trim() === "" ? null : Number(capacity.replace(",", "."));
        const { error } = await supabase
          .from("gp_trips")
          .update({
            origin_city: origin.trim(),
            destination_city: destination.trim(),
            departure_at: depart || null,
            capacity_kg: capacityNum,
            remaining_capacity_kg: capacityNum,
            price_label: price.trim(),
            status,
          })
          .eq("id", id)
          .eq("transporter_id", user.id);
        if (error) {
          setMessage(errText(error));
          return;
        }
      } else {
        const { error } = await supabase
          .from("local_availabilities")
          .update({
            location: location.trim(),
            district: district.trim(),
            price_label: price.trim(),
            status,
          })
          .eq("id", id)
          .eq("transporter_id", user.id);
        if (error) {
          setMessage(errText(error));
          return;
        }
      }
      setOk(true);
      setMessage("Annonce mise à jour.");
    } catch (err) {
      setMessage(errText(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Supprimer cette annonce ?")) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const table = kind === "gp" ? "gp_trips" : "local_availabilities";
    const { error } = await supabase.from(table).delete().eq("id", id).eq("transporter_id", user.id);
    if (error) {
      setMessage(errText(error));
      setSaving(false);
      return;
    }
    router.push("/dashboard");
  }

  if (loading) return <p className="text-[#698084]">Chargement…</p>;

  return (
    <div className="max-w-xl">
      <Link href="/dashboard" className="text-sm text-[#176c64] underline">
        ← Mon compte
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">
        Modifier l&apos;annonce {kind === "gp" ? "GP" : "Tiak-Tiak"}
      </h1>

      <form onSubmit={save} className="bg-white border border-[#e1e9e8] rounded-2xl p-6 space-y-4">
        {kind === "gp" ? (
          <>
            <div>
              <label className="block text-xs font-bold mb-1">Ville de départ</label>
              <input
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                required
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Destination</label>
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                required
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Date de départ</label>
              <input
                type="date"
                value={depart}
                onChange={e => setDepart(e.target.value)}
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Capacité (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                placeholder="Ex. 15"
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-bold mb-1">Ville / zone</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Quartier / couverture</label>
              <input
                value={district}
                onChange={e => setDistrict(e.target.value)}
                required
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-bold mb-1">Tarif indicatif</label>
          <input
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Statut</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          >
            <option value="active">Active (visible)</option>
            <option value="inactive">Inactive (masquée)</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#176c64] text-white font-bold rounded-xl px-6 py-3 disabled:opacity-60"
          >
            {saving ? "…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={saving}
            className="bg-red-50 text-red-700 font-semibold rounded-xl px-6 py-3 border border-red-200"
          >
            Supprimer
          </button>
        </div>
      </form>

      {message && (
        <p className={`mt-4 text-sm ${ok ? "text-green-700" : "text-red-700"}`}>{message}</p>
      )}
    </div>
  );
}
