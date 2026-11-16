"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppRole } from "@/lib/roles";

const OPTIONS: {
  role: AppRole;
  title: string;
  emoji: string;
  description: string;
  whatYouSee: string;
}[] = [
  {
    role: "particulier",
    title: "Personnel",
    emoji: "👤",
    description: "Je cherche un Tiak-Tiak ou un GP pour envoyer un colis.",
    whatYouSee: "Tu verras toutes les offres et tu pourras publier « je cherche ».",
  },
  {
    role: "commercant",
    title: "Commerçant",
    emoji: "🏪",
    description: "Je suis un commerce et j'ai besoin de livraisons régulières.",
    whatYouSee: "Même accès que Personnel + possibilité de publier des demandes.",
  },
  {
    role: "tiak_tiak",
    title: "Tiak-Tiak",
    emoji: "🛵",
    description: "Je livre en local. Je publie mes disponibilités.",
    whatYouSee: "Tu verras les demandes clients (pas les autres Tiak-Tiak).",
  },
  {
    role: "gp",
    title: "GP",
    emoji: "✈️",
    description: "Je voyage (Sénégal, France, Maroc, Chine, Dubaï, Turquie…).",
    whatYouSee: "Tu verras les demandes clients qui cherchent un GP.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AppRole | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (!selected) {
      setMessage("Choisis un type de profil.");
      return;
    }
    if (!isSupabaseConfigured()) {
      localStorage.setItem("yobbugo_role", selected);
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setMessage("Connecte-toi d'abord.");
        router.push("/login");
        return;
      }

      const { error } = await supabase.rpc("set_my_role", { p_role: selected });

      if (error) {
        setMessage("Impossible d’enregistrer ce profil. Réessaie plus tard.");
        return;
      }

      if (selected === "tiak_tiak" || selected === "gp") {
        await supabase.from("transporter_profiles").upsert({
          user_id: user.id,
          kind: selected === "tiak_tiak" ? "tiak_tiak" : "gp",
        });
        router.push("/publish");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Bienvenue sur YobbuGo</h1>
        <p className="text-[#698084]">
          Choisis ton profil. Tu pourras le modifier plus tard.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {OPTIONS.map(opt => (
          <button
            key={opt.role}
            type="button"
            onClick={() => setSelected(opt.role)}
            className={`text-left bg-white border-2 rounded-2xl p-5 transition ${
              selected === opt.role
                ? "border-[#176c64] ring-2 ring-[#176c64]/30"
                : "border-[#e0e9e7] hover:border-[#176c64]/50"
            }`}
          >
            <div className="text-3xl mb-2">{opt.emoji}</div>
            <div className="font-bold text-lg mb-1">{opt.title}</div>
            <p className="text-sm text-[#425d61] mb-2">{opt.description}</p>
            {selected === opt.role && (
              <p className="text-xs text-[#176c64] font-medium">{opt.whatYouSee}</p>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={loading || !selected}
        onClick={confirm}
        className="w-full sm:w-auto block mx-auto bg-[#efbb45] text-[#243234] font-bold rounded-xl px-8 py-3 disabled:opacity-50"
      >
        {loading ? "…" : "Continuer"}
      </button>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
