"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function normalizeWhatsApp(input: string) {
  const digits = input.replace(/\D/g, "").replace(/^00/, "");
  if (!digits) return "";
  const withCountryCode = digits.startsWith("221") ? digits : `221${digits.replace(/^0/, "")}`;
  return withCountryCode.length >= 8 && withCountryCode.length <= 15 ? `+${withCountryCode}` : null;
}

export function TransporterContactSettings() {
  const [phone, setPhone] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("transporter_profiles")
        .select("whatsapp_enabled, whatsapp_e164")
        .eq("user_id", user.id)
        .maybeSingle();
      setEnabled(Boolean(data?.whatsapp_enabled));
      setPhone(data?.whatsapp_e164 || "");
      setLoading(false);
    }
    void load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const number = normalizeWhatsApp(phone);
    if (enabled && !number) {
      setMessage("Indique un numéro WhatsApp valide, par exemple +221 77 123 45 67.");
      return;
    }
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("transporter_profiles").upsert({
      user_id: user.id,
      whatsapp_enabled: enabled,
      whatsapp_e164: enabled ? number : null,
    });
    setSaving(false);
    setMessage(error ? error.message : "Coordonnées WhatsApp enregistrées.");
  }

  if (loading) return null;

  return (
    <section className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
      <h2 className="font-bold text-lg mb-2">Contact WhatsApp</h2>
      <p className="text-sm text-[#425d61] mb-4">
        Autorise les personnes qui consultent tes annonces à te contacter sur WhatsApp.
        Ton numéro n’est affiché que via ce bouton.
      </p>
      <form onSubmit={save} className="space-y-3">
        <label className="block text-sm font-semibold">
          Numéro WhatsApp
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+221 77 123 45 67"
            className="mt-1 w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </label>
        <label className="flex gap-2 items-start text-sm text-[#425d61]">
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="mt-1" />
          <span>J’autorise YobbuGo à ajouter un bouton WhatsApp sur mes annonces.</span>
        </label>
        <button type="submit" disabled={saving} className="bg-[#176c64] text-white font-semibold rounded-xl px-5 py-2.5 disabled:opacity-60">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        {message && <p className="text-sm text-[#425d61]">{message}</p>}
      </form>
    </section>
  );
}
