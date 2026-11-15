"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function PublishPage() {
  const router = useRouter();
  const [type, setType] = useState<"local" | "gp">("gp");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");

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
          user.user_metadata?.phone ||
          ""
      );
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const rolesList = roles?.map(r => r.role) || [];
      if (rolesList.includes("tiak_tiak")) setType("local");
      if (rolesList.includes("gp")) setType("gp");
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
    const name = String(form.get("name") || displayName).trim();

    try {
      if (!isSupabaseConfigured()) {
        setMessage("Supabase non configuré — annonce non enregistrée.");
        setLoading(false);
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

      // Ensure transporter profile exists
      await supabase.from("transporter_profiles").upsert({
        user_id: user.id,
        kind: type === "local" ? "tiak_tiak" : "gp",
      });

      if (name) {
        await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
      }

      if (type === "gp") {
        const { error } = await supabase.from("gp_trips").insert({
          transporter_id: user.id,
          origin_city: from,
          destination_city: to,
          departure_at: depart,
          price_label: price,
          status: "active",
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("local_availabilities").insert({
          transporter_id: user.id,
          location: from,
          district: to,
          price_label: price,
          status: "active",
        });
        if (error) throw error;
      }

      setSuccess(true);
      setMessage(
        type === "gp"
          ? `Annonce GP enregistrée : ${from} → ${to} · ${price}`
          : `Annonce Tiak-Tiak enregistrée : ${from} / ${to} · ${price}`
      );
      e.currentTarget.reset();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Publier une disponibilité</h1>
      <p className="text-sm text-[#698084] mb-6">
        L'annonce sera visible par les clients. Le paiement se fait directement avec eux.
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
          <input
            name="from"
            required
            placeholder={type === "gp" ? "Dakar" : "Dakar"}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">
            {type === "gp" ? "Destination" : "Quartier / couverture"}
          </label>
          <input
            name="to"
            required
            placeholder={type === "gp" ? "Paris" : "Plateau, Médina…"}
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
        {type === "gp" && (
          <div>
            <label className="block text-xs font-bold mb-1">Date de départ</label>
            <input name="depart" type="date" className="w-full border border-[#d3e0dd] rounded-lg p-3" />
          </div>
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
          className={`mt-6 max-w-2xl rounded-xl p-4 text-sm ${
            success
              ? "bg-[#e3f6e8] text-[#23754a] border border-[#b8e6c4]"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <p className="font-semibold">{success ? "✓ Annonce publiée" : "Erreur"}</p>
          <p className="mt-1">{message}</p>
          {success && (
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/gp" className="underline font-medium">
                Voir les GP
              </Link>
              <Link href="/local" className="underline font-medium">
                Voir le local
              </Link>
              <Link href="/dashboard" className="underline font-medium">
                Mon compte
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
