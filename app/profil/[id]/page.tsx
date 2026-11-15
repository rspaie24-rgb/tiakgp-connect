"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { whatsappLink, telLink } from "@/lib/contact";

type Profile = {
  display_name: string;
  phone: string | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
};

export default function ProfilPage() {
  const params = useParams();
  const id = String(params.id || "");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", id)
        .maybeSingle();
      setProfile(p as Profile | null);

      const { data: revs } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at")
        .eq("transporter_id", id)
        .order("created_at", { ascending: false });
      const list = (revs as Review[]) || [];
      setReviews(list);
      if (list.length) {
        setAvg(list.reduce((s, r) => s + r.rating, 0) / list.length);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) return <p className="text-[#698084]">Chargement…</p>;
  if (!profile) return <p>Profil introuvable.</p>;

  const wa = whatsappLink(profile.phone, `Bonjour ${profile.display_name}, je vous contacte via YobbuGo.`);
  const tel = telLink(profile.phone);

  return (
    <div className="max-w-xl">
      <Link href="/gp" className="text-sm text-[#176c64] underline">
        ← Retour
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-1">{profile.display_name}</h1>
      <p className="text-[#698084] mb-4">
        {avg > 0 ? `⭐ ${avg.toFixed(1)} (${reviews.length} avis)` : "Pas encore d'avis"}
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {tel && (
          <a href={tel} className="bg-[#176c64] text-white font-semibold rounded-xl px-5 py-2.5">
            📞 Appeler
          </a>
        )}
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25d366] text-white font-semibold rounded-xl px-5 py-2.5"
          >
            WhatsApp
          </a>
        )}
        <Link
          href={`/messages/${id}`}
          className="border border-[#176c64] text-[#176c64] font-semibold rounded-xl px-5 py-2.5"
        >
          Message interne
        </Link>
      </div>

      <h2 className="font-bold mb-3">Avis</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-[#698084]">Aucun avis pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map(r => (
            <li key={r.id} className="bg-white border border-[#e0e9e7] rounded-xl p-4">
              <div className="text-yellow-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
              <div className="text-xs text-[#698084] mt-1">
                {new Date(r.created_at).toLocaleDateString("fr-FR")}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link href={`/avis/${id}`} className="text-sm text-[#176c64] underline">
          Laisser un avis
        </Link>
      </div>
    </div>
  );
}
