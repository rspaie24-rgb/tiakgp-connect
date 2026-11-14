"use client";

import { useParams } from "next/navigation";
import { localTransporters, gpTrips } from "@/lib/mock-data";
import { RequestDialog } from "@/components/RequestDialog";
import { useState } from "react";

export default function TransporterProfile() {
  const params = useParams();
  const id = Number(params.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  const local = localTransporters.find(t => t.id === id);
  const gp = gpTrips.find(t => t.id === id);
  const t = local || gp;

  if (!t) return <div>Transporteur non trouvé</div>;

  const isLocal = !!local;

  // Mock WhatsApp (consentement à implémenter avec Supabase)
  const whatsappLink = `https://wa.me/221771234567?text=${encodeURIComponent(
    `Bonjour ${t.name}, je vous contacte via TiakGP Connect concernant une demande de transport.`
  )}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-[#d9eeea] text-[#12554e] rounded-2xl grid place-items-center text-3xl">
            {isLocal ? "🛵" : "✈️"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.name}</h1>
            <div className="text-[#698084]">⭐ {t.rating} · {t.reviews} avis</div>
          </div>
        </div>

        <div className="mb-4">
          <span className="inline-block bg-[#e3f6e8] text-[#23754a] text-xs font-bold px-3 py-1 rounded-full">
            ● Disponible
          </span>
        </div>

        <div className="text-[#425d61] space-y-1 mb-4">
          {isLocal ? (
            <>
              <p>📍 {local!.zone} — {local!.district}</p>
              <p>🗺️ {local!.coverage}</p>
            </>
          ) : (
            <>
              <p>🌍 {gp!.from} → {gp!.to}</p>
              <p>🛫 Départ : {gp!.depart}</p>
              <p>📦 Capacité : {gp!.capacity}</p>
            </>
          )}
        </div>

        <div className="text-2xl font-extrabold text-[#155e58] mb-2">{t.price}</div>
        <p className="text-xs text-[#698084] mb-6">
          Prix indicatif. Modalités de paiement à convenir directement avec le transporteur (hors plateforme).
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setDialogOpen(true)}
            className="flex-1 bg-[#176c64] text-white rounded-xl py-3 font-semibold"
          >
            Demander un transport
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] text-white rounded-xl py-3 font-semibold text-center"
          >
            Contacter sur WhatsApp
          </a>
        </div>
        <p className="text-xs text-[#698084] mt-3 text-center">
          Le bouton WhatsApp apparaît uniquement si le transporteur a donné son consentement (démo).
        </p>
      </div>

      <div className="bg-white border border-[#e0e9e7] rounded-2xl p-6">
        <h2 className="font-bold mb-3">Avis récents (démo)</h2>
        <div className="space-y-3 text-sm">
          <div className="border-b pb-2">
            <div className="font-semibold">Awa D. ⭐ 5</div>
            <p className="text-[#425d61]">Livraison rapide et soignée, je recommande !</p>
          </div>
          <div>
            <div className="font-semibold">Moussa K. ⭐ 4</div>
            <p className="text-[#425d61]">Bon service, communication claire.</p>
          </div>
        </div>
      </div>

      <RequestDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        transporterName={t.name}
      />
    </div>
  );
}
