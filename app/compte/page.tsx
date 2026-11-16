"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function requestDeletion() {
    if (!isSupabaseConfigured()) {
      setMessage("Le service de compte n’est pas configuré.");
      return;
    }
    if (!window.confirm("Demander la suppression définitive de votre compte et de vos données ?")) return;

    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("account_deletion_requests")
      .insert({ user_id: user.id, status: "requested" });

    if (error && error.code !== "23505") {
      setMessage("La demande n’a pas pu être envoyée. Réessayez plus tard.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setMessage("Votre demande a été enregistrée. Nous vous confirmerons la suppression une fois le traitement terminé.");
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <p className="mt-2 text-sm text-[#698084]">Gérez vos données et votre compte YobbuGo.</p>
      </div>
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-bold text-red-900">Supprimer mon compte</h2>
        <p className="mt-2 text-sm text-red-900">
          Cette action demande la suppression de votre compte et des données associées,
          sous réserve des obligations légales de conservation.
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={requestDeletion}
          className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Envoi…" : "Demander la suppression"}
        </button>
        {message && <p className="mt-3 text-sm text-red-900">{message}</p>}
      </section>
      <Link href="/dashboard" className="text-sm text-[#176c64] underline">← Retour au tableau de bord</Link>
    </div>
  );
}
