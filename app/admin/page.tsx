"use client";

import { useState } from "react";

type Report = {
  id: number;
  type: "profil" | "annonce" | "message";
  subject: string;
  reporter: string;
  reason: string;
  status: "ouvert" | "en_cours" | "traité" | "rejeté";
  date: string;
};

type Request = {
  id: number;
  client: string;
  transporter: string;
  type: "Local" | "GP";
  status: "envoyée" | "acceptée" | "en_cours" | "livrée" | "annulée" | "litige";
  details: string;
  date: string;
};

const initialReports: Report[] = [
  { id: 1, type: "profil", subject: "Fatou Courses", reporter: "Awa D.", reason: "Comportement inapproprié", status: "ouvert", date: "2026-11-14" },
  { id: 2, type: "annonce", subject: "GP Moussa — Dakar→Paris", reporter: "Moussa K.", reason: "Prix trompeur", status: "en_cours", date: "2026-11-13" },
  { id: 3, type: "message", subject: "Demande #42", reporter: "Aminata", reason: "Harcèlement", status: "ouvert", date: "2026-11-12" },
];

const initialRequests: Request[] = [
  { id: 101, client: "Awa Diop", transporter: "Mamadou Ndiaye", type: "Local", status: "envoyée", details: "Colis 3 kg Plateau → Médina", date: "2026-11-14" },
  { id: 102, client: "Ibrahima Sall", transporter: "GP Aminata", type: "GP", status: "acceptée", details: "8 kg Paris → Dakar", date: "2026-11-11" },
  { id: 103, client: "Fatou Ndiaye", transporter: "Ibrahima Express", type: "Local", status: "litige", details: "Retard de livraison", date: "2026-11-10" },
];

export default function AdminPage() {
  const [reports, setReports] = useState(initialReports);
  const [requests, setRequests] = useState(initialRequests);
  const [tab, setTab] = useState<"reports" | "requests">("reports");

  function updateReportStatus(id: number, status: Report["status"]) {
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
  }

  function updateRequestStatus(id: number, status: Request["status"]) {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Espace Administrateur</h1>
      <p className="text-sm text-[#698084] mb-6">Gestion des signalements et des requêtes (données mock — Supabase demain)</p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("reports")}
          className={`px-4 py-2 rounded-xl font-semibold ${tab === "reports" ? "bg-[#176c64] text-white" : "bg-white border"}`}
        >
          Signalements ({reports.filter(r => r.status === "ouvert" || r.status === "en_cours").length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 rounded-xl font-semibold ${tab === "requests" ? "bg-[#176c64] text-white" : "bg-white border"}`}
        >
          Requêtes ({requests.length})
        </button>
      </div>

      {tab === "reports" && (
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white border border-[#e0e9e7] rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-bold">{r.subject}</div>
                  <div className="text-sm text-[#698084]">Type : {r.type} · Signalé par {r.reporter} · {r.date}</div>
                  <p className="mt-1 text-sm">{r.reason}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === "ouvert" ? "bg-red-100 text-red-700" : r.status === "en_cours" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                  {r.status}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => updateReportStatus(r.id, "en_cours")} className="text-xs bg-[#efbb45] px-3 py-1 rounded-lg font-semibold">Prendre en charge</button>
                <button onClick={() => updateReportStatus(r.id, "traité")} className="text-xs bg-[#176c64] text-white px-3 py-1 rounded-lg font-semibold">Marquer traité</button>
                <button onClick={() => updateReportStatus(r.id, "rejeté")} className="text-xs bg-gray-200 px-3 py-1 rounded-lg font-semibold">Rejeter</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-white border border-[#e0e9e7] rounded-2xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-bold">{r.client} → {r.transporter}</div>
                  <div className="text-sm text-[#698084]">{r.type} · {r.date}</div>
                  <p className="mt-1 text-sm">{r.details}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#e3f6e8] text-[#23754a] capitalize">
                  {r.status}
                </span>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {(["envoyée", "acceptée", "en_cours", "livrée", "annulée", "litige"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => updateRequestStatus(r.id, s)}
                    className="text-xs border px-2 py-1 rounded-lg hover:bg-gray-50 capitalize"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-[#72878a]">
        Note : les formules de tarification (GP / Tiak-Tiak) et les prix seront définis à la fin. 
        Les actions ici sont simulées en local.
      </p>
    </div>
  );
}
