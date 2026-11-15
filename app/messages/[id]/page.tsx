"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Msg = {
  id: number;
  from_user: string;
  body: string;
  created_at: string;
};

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const otherId = String(params.id || "");
  const [me, setMe] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setMe(user.id);

      const { data } = await supabase
        .from("messages")
        .select("id, from_user, body, created_at")
        .or(`and(from_user.eq.${user.id},to_user.eq.${otherId}),and(from_user.eq.${otherId},to_user.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMsgs((data as Msg[]) || []);
      setLoading(false);
    }
    if (otherId) load();
  }, [otherId, router]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !me) return;
    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      from_user: me,
      to_user: otherId,
      body: text.trim(),
    });
    if (!error) {
      setMsgs(prev => [
        ...prev,
        { id: Date.now(), from_user: me, body: text.trim(), created_at: new Date().toISOString() },
      ]);
      setText("");
    }
  }

  if (loading) return <p className="text-[#698084]">Chargement…</p>;

  return (
    <div className="max-w-lg">
      <Link href="/dashboard" className="text-sm text-[#176c64] underline">
        ← Mon compte
      </Link>
      <h1 className="text-xl font-bold mt-4 mb-4">Conversation</h1>

      <div className="bg-white border border-[#e0e9e7] rounded-2xl p-4 h-80 overflow-y-auto space-y-3 mb-4">
        {msgs.length === 0 && <p className="text-sm text-[#698084]">Aucun message. Envoie le premier !</p>}
        {msgs.map(m => (
          <div
            key={m.id}
            className={`text-sm p-2 rounded-lg max-w-[80%] ${
              m.from_user === me ? "ml-auto bg-[#176c64] text-white" : "bg-[#f0f4f4]"
            }`}
          >
            {m.body}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 border border-[#d3e0dd] rounded-lg p-3"
        />
        <button type="submit" className="bg-[#efbb45] text-[#243234] font-bold rounded-lg px-4">
          Envoyer
        </button>
      </form>
    </div>
  );
}
