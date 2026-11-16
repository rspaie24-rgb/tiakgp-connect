"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppRole } from "@/lib/roles";

function errText(err: unknown): string {
  if (!err) return "Erreur inconnue";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const o = err as { message?: string; details?: string; hint?: string; code?: string };
  return [o.message, o.details, o.hint, o.code].filter(Boolean).join(" — ") || JSON.stringify(err);
}

export default function PublishPage() {
  const router = useRouter();
  const [type, setType] = useState<"local" | "gp">("gp");
  const [available, setAvailable] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<AppRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setDisplayName(
        (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.phone as string) ||
          ""
      );
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const rolesList = roles?.map(r => r.role) || [];
      const selectedRole = (rolesList[0] as AppRole | undefined) || null;
      setRole(selectedRole);
      if (rolesList.includes("gp")) setType("gp");
      setReady(true);
    }
    init();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const from = String(form.get("from") || "").trim();
    const to = String(form.get("to") || "").trim();
    const price = String(form.get("price") || "").trim();
    const depart = String(form.get("depart") || "") || null;
    const capacityRaw = String(form.get("capacity") || "").trim();
    const capacity = capacityRaw === "" ? null : Number(capacityRaw.replace(",", "."));
    const name = String(form.get("name") || displayName).trim();

    try {
      if (role === "tiak_tiak") {
        setMessage("Les comptes Tiak-Tiak ne publient pas d'annonce. Consulte les demandes des clients depuis les catalogues.");
        return;
      }
      if (!isSupabaseConfigured()) {
        setMessage("Supabase non configuré — annonce non enregistrée.");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMessage("Connecte-toi pour publier.");
        router.push("/login");
        return;
      }

      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: name || user.user_metadata?.full_name || "Utilisateur",
        phone: (user.user_metadata?.phone as string) || null,
      });
      if (profileErr) {
        setMessage("Profil : " + errText(profileErr));
        return;
      }

      const { error: tpErr } = await supabase.from("transporter_profiles").upsert({
        user_id: user.id,
        kind: type === "local" ? "tiak_tiak" : "gp",
      });
      if (tpErr) {
        setMessage("Profil transporteur : " + errText(tpErr));
        return;
      }

      if (type === "gp") {
        const { error } = await supabase.from("gp_trips").insert({
          transporter_id: user.id,
          origin_city: from,
          destination_city: to,
          departure_at: depart,
          capacity_kg: capacity,
          remaining_capacity_kg: capacity,
          price_label: price,
          status: "active",
        });
        if (error) {
          setMessage("GP : " + errText(error));
          return;
        }
      } else {
        const { error } = await supabase.from("local_availabilities").insert({
          transporter_id: user.id,
          location: from,
          district: to,
          price_label: price,
          status: available ? "available" : "unavailable",
        });
        if (error) {
          setMessage("Local : " + errText(error));
          return;
        }
      }

      setSuccess(true);
      setMessage(
        type === "gp"
          ? `Annonce GP enregistrée : ${from} → ${to} · ${price}`
          : `Annonce Tiak-Tiak enregistrée : ${from} / ${to} · ${available ? "Disponible" : "Non disponible"}`
      );
    } catch (err: unknown) {
      setMessage(errText(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Publier une disponibilité</h1>
      {ready && role === "tiak_tiak" ? (
        <div className="max-w-2xl bg-white border border-[#e1e9e8] rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-2">Publication non disponible pour les Tiak-Tiak</h2>
          <p className="text-sm text-[#425d61] mb-4">
            Les Tiak-Tiak ne publient pas d&apos;annonce. Ils consultent les demandes des particuliers et commerçants, ainsi que les annonces GP.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/local" className="bg-[#176c64] text-white font-semibold rounded-xl px-5 py-3">Voir les demandes locales</Link>
            <Link href="/gp" className="bg-[#efbb45] text-[#243234] font-semibold rounded-xl px-5 py-3">Voir les annonces GP</Link>
          </div>
        </div>
      ) : (
      <>
      <p className="text-sm text-[#698084] mb-6">
        L&apos;annonce sera visible par les clients. Tu pourras la modifier plus tard depuis ton compte.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#e1e9e8] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl"
      >
        <div>
          <label className="block text-xs font-bold mb-1">Type</label>
          <select
            name="type"
            value={type}
            onChange={e => setType(e.target.value as "local" | "gp")}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          >
            <option value="local">Tiak-Tiak</option>
            <option value="gp">GP international</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Nom affiché</label>
          <input
            name="name"
            required
            defaultValue={displayName}
            placeholder="Votre nom"
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">
            {type === "gp" ? "Ville de départ" : "Ville / zone"}
          </label>
          <input name="from" required placeholder="Dakar, Pikine…" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">
            {type === "gp" ? "Destination" : "Alentours / couverture"}
          </label>
          <input
            name="to"
            required
            placeholder={type === "gp" ? "Paris" : "Pikine et alentours, Guédiawaye…"}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Tarif indicatif</label>
          <input
            name="price"
            required
            placeholder={type === "gp" ? "Ex. 10 €/kg" : "Ex. 2 000 FCFA"}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        {type === "local" && (
          <div className="flex items-center gap-3 pt-6">
            <input
              id="available"
              type="checkbox"
              checked={available}
              onChange={e => setAvailable(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="available" className="text-sm font-semibold">
              Disponible maintenant
            </label>
          </div>
        )}
        {type === "gp" && (
          <>
            <div>
              <label className="block text-xs font-bold mb-1">Date de départ</label>
              <input name="depart" type="date" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Capacité (kg)</label>
              <input
                name="capacity"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex. 15"
                className="w-full border border-[#d3e0dd] rounded-lg p-3"
              />
            </div>
          </>
        )}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#efbb45] text-[#243234] font-bold rounded-xl px-6 py-3 disabled:opacity-60"
          >
            {loading ? "Publication…" : "Publier l'annonce"}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`mt-6 max-w-2xl rounded-xl p-4 text-sm break-words ${
            success
              ? "bg-[#e3f6e8] text-[#23754a] border border-[#b8e6c4]"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <p className="font-semibold">{success ? "✓ Annonce publiée" : "Erreur"}</p>
          <p className="mt-1">{message}</p>
          {success && (
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/dashboard" className="underline font-medium">
                Voir mes annonces
              </Link>
              <Link href="/local" className="underline font-medium">
                Catalogue Local
              </Link>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}
