"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isLaunchFreePeriod, daysLeftInLaunch, LAUNCH_FREE_UNTIL } from "@/lib/subscription";
import type { AppRole } from "@/lib/roles";

export default function AbonnementPage() {
  const router = useRouter();
  const [role, setRole] = useState<AppRole | null>(null);
  const [name, setName] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
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
          (user.user_metadata?.phone as string) ||
          ""
      );

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1);
      const r = (roles?.[0]?.role as AppRole) || null;
      setRole(r);

      // During free launch, all transporters have access
      if (isLaunchFreePeriod() && (r === "gp" || r === "tiak_tiak")) {
        setHasAccess(true);
        setEndsAt(LAUNCH_FREE_UNTIL.toISOString());
        setLoading(false);
        return;
      }

      // After launch: check subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("ends_at, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) {
        setHasAccess(true);
        setEndsAt(sub.ends_at);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <p className="text-[#698084]">Chargement…</p>;

  const isTransporter = role === "gp" || role === "tiak_tiak";
  const free = isLaunchFreePeriod();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Mon abonnement</h1>

      {!isTransporter && (
        <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
          <p className="text-[#425d61]">
            L’abonnement concerne uniquement les profils <strong>GP</strong> et <strong>Tiak-Tiak</strong>.
            En tant que {role === "commercant" ? "commerçant" : "particulier"}, tu publies des demandes gratuitement.
          </p>
          <Link href="/chercher" className="inline-block mt-4 text-[#176c64] underline">
            Publier une demande
          </Link>
        </div>
      )}

      {isTransporter && free && (
        <div className="bg-[#e3f6e8] border border-[#b8e6c4] rounded-2xl p-6">
          <div className="text-lg font-bold text-[#23754a] mb-2">
            🎉 Lancement gratuit — 6 mois
          </div>
          <p className="text-sm text-[#1a5c3a] mb-3">
            Pendant le lancement, tu as accès à toutes les demandes des clients et à leurs coordonnées, sans payer.
          </p>
          <p className="text-sm">
            Fin du lancement : <strong>15 mai 2027</strong> ({daysLeftInLaunch()} jours restants).
          </p>
          <p className="text-xs text-[#698084] mt-3">
            Après cette date, l’accès aux coordonnées des chercheurs coûtera 1 500 FCFA / mois.
          </p>
        </div>
      )}

      {isTransporter && !free && (
        <div className={`rounded-2xl p-6 border ${
          hasAccess
            ? "bg-[#e3f6e8] border-[#b8e6c4]"
            : "bg-amber-50 border-amber-200"
        }`}>
          {hasAccess ? (
            <>
              <div className="text-lg font-bold text-[#23754a] mb-2">Abonnement actif</div>
              <p className="text-sm">
                Accès aux demandes et coordonnées jusqu’au{" "}
                <strong>
                  {endsAt
                    ? new Date(endsAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </strong>
                .
              </p>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-amber-800 mb-2">Abonnement requis</div>
              <p className="text-sm text-amber-900 mb-3">
                Pour voir les demandes des clients et leurs numéros de téléphone, active un mois d’accès.
              </p>
              <p className="text-2xl font-bold text-[#132a35] mb-1">1 500 FCFA</p>
              <p className="text-xs text-[#698084] mb-4">par mois · renouvelable</p>
              <div className="bg-white/70 rounded-xl p-3 text-sm text-[#425d61]">
                Le paiement en ligne arrive bientôt. Pour l’instant, contacte l’équipe YobbuGo pour activer ton mois.
              </div>
            </>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-[#698084]">
        <Link href="/dashboard" className="underline">
          ← Mon compte
        </Link>
      </p>
    </div>
  );
}
