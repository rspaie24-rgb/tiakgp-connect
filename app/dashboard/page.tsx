"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ROLE_LABELS, isTransporter, type AppRole } from "@/lib/roles";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<AppRole | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

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

      const r = (roles?.[0]?.role as AppRole) || (localStorage.getItem("yobbugo_role") as AppRole) || null;
      if (!r) {
        router.replace("/onboarding");
        return;
      }
      setRole(r);
      setLoading(false);
    }
    load();
  }, [router]);

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

      {transporter ? (
        <div className="space-y-6">
          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-2">Espace transporteur</h2>
            <p className="text-sm text-[#425d61] mb-4">
              Publie tes disponibilités pour que les clients te trouvent. Le paiement se fait
              directement avec eux.
            </p>
            <Link
              href="/publish"
              className="inline-block bg-[#efbb45] text-[#243234] font-bold rounded-xl px-6 py-3"
            >
              + Publier une annonce
            </Link>
          </div>
          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold mb-2">Mes annonces</h2>
            <p className="text-sm text-[#698084]">
              Les annonces publiées apparaîtront ici (synchronisation Supabase en cours).
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-2">Que cherches-tu ?</h2>
            <p className="text-sm text-[#425d61] mb-4">
              Filtre par ville, quartier ou trajet pour trouver un transporteur.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/local"
                className="bg-[#176c64] text-white font-semibold rounded-xl px-5 py-3"
              >
                🛵 Tiak-Tiak (local)
              </Link>
              <Link
                href="/gp"
                className="bg-[#176c64] text-white font-semibold rounded-xl px-5 py-3"
              >
                ✈️ GP international
              </Link>
            </div>
          </div>
          <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
            <h2 className="font-bold mb-2">Mes demandes</h2>
            <p className="text-sm text-[#698084]">
              Tes demandes de transport s&apos;afficheront ici.
            </p>
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
