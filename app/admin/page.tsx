"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ReportRow = {
  id: number;
  subject_type: string | null;
  subject_id: string | null;
  reason: string | null;
  status: string | null;
  created_at: string | null;
};

type RequestRow = {
  id: number;
  pickup_location: string | null;
  dropoff_location: string | null;
  description: string | null;
  status: string | null;
  requested_at: string | null;
};

export default function AdminPage() {
  const [tab, setTab] = useState<"reports" | "requests" | "stats">("stats");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [counts, setCounts] = useState({ gp: 0, local: 0, users: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setError("Supabase non configuré");
        setLoading(false);
        return;
      }
      const supabase = createClient();

      const [gp, local, profiles, reps, reqs] = await Promise.all([
        supabase.from("gp_trips").select("id", { count: "exact", head: true }),
        supabase.from("local_availabilities").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("transport_requests").select("*").order("requested_at", { ascending: false }).limit(50),
      ]);

      setCounts({
        gp: gp.count || 0,
        local: local.count || 0,
        users: profiles.count || 0,
      });
      if (reps.error) setError(reps.error.message);
      else setReports((reps.data as ReportRow[]) || []);
      if (reqs.error && !reps.error) setError(reqs.error.message);
      setRequests((reqs.data as RequestRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  async function setReportStatus(id: number, status: string) {
    const supabase = createClient();
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  }

  async function setRequestStatus(id: number, status: string) {
    const supabase = createClient();
    await supabase.from("transport_requests").update({ status }).eq("id", id);
    setRequests(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Espace maintenance</h1>
      <p className="text-sm text-white/60 mb-6">
        Réservé à l&apos;équipe YobbuGo — signalements, requêtes et vue d&apos;ensemble.
        Accès : /admin (non listé dans le menu utilisateurs).
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["stats", "reports", "requests"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm ${
              tab === t ? "bg-[#f5c65d] text-[#132a35]" : "bg-white/10"
            }`}
          >
            {t === "stats" ? "Vue d'ensemble" : t === "reports" ? "Signalements" : "Requêtes"}
          </button>
        ))}
      </div>

      {loading && <p className="text-white/50">Chargement…</p>}
      {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

      {tab === "stats" && !loading && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-3xl font-bold text-[#f5c65d]">{counts.users}</div>
            <div className="text-sm text-white/70">Profils</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-3xl font-bold text-[#f5c65d]">{counts.gp}</div>
            <div className="text-sm text-white/70">Annonces GP</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-3xl font-bold text-[#f5c65d]">{counts.local}</div>
            <div className="text-sm text-white/70">Annonces Tiak-Tiak</div>
          </div>
        </div>
      )}

      {tab === "reports" && !loading && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-white/50">Aucun signalement.</p>
          ) : (
            reports.map(r => (
              <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="font-semibold">
                  {r.subject_type} #{r.subject_id}
                </div>
                <p className="text-sm text-white/70 mt-1">{r.reason}</p>
                <div className="text-xs text-white/40 mt-1">{r.created_at}</div>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10">{r.status}</span>
                  <button
                    onClick={() => setReportStatus(r.id, "en_cours")}
                    className="text-xs px-2 py-1 rounded-lg bg-[#f5c65d]/20"
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => setReportStatus(r.id, "traite")}
                    className="text-xs px-2 py-1 rounded-lg bg-green-500/20"
                  >
                    Traité
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "requests" && !loading && (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-white/50">Aucune requête.</p>
          ) : (
            requests.map(r => (
              <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="font-semibold">
                  {r.pickup_location} → {r.dropoff_location}
                </div>
                <p className="text-sm text-white/70 mt-1">{r.description}</p>
                <div className="text-xs text-white/40 mt-1">{r.requested_at}</div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10">{r.status}</span>
                  {(["acceptee", "en_cours", "livree", "litige", "annulee"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setRequestStatus(r.id, s)}
                      className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
