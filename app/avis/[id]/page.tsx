"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AvisPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error } = await supabase.from("reviews").insert({
      author_id: user.id,
      transporter_id: id,
      rating,
      comment: comment.trim() || null,
    });
    if (error) setMsg(error.message);
    else {
      setMsg("Avis envoyé, merci !");
      setTimeout(() => router.push(`/profil/${id}`), 1000);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Laisser un avis</h1>
      <form onSubmit={submit} className="bg-white border border-[#e0e9e7] rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1">Note</label>
          <select
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>
                {n} étoile{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Commentaire</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="w-full border border-[#d3e0dd] rounded-lg p-3"
          />
        </div>
        <button type="submit" className="bg-[#efbb45] text-[#243234] font-bold rounded-xl px-6 py-3">
          Envoyer l&apos;avis
        </button>
      </form>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
