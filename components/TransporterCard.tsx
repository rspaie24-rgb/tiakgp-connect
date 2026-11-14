"use client";

import Link from "next/link";
import { RequestDialog } from "./RequestDialog";
import { useState } from "react";

type Props = {
  id: number;
  name: string;
  rating: string;
  reviews: number;
  available: boolean;
  details: React.ReactNode;
  price: string;
  icon: string;
};

export function TransporterCard({ id, name, rating, reviews, available, details, price, icon }: Props) {
  const [open, setOpen] = useState(false);

  function handleWhatsApp() {
    alert(
      `Démo WhatsApp : dans la version réelle, ce bouton ouvrira WhatsApp uniquement si ${name} a autorisé la publication de son numéro. Aucun numéro réel n’est associé aux profils fictifs.`
    );
  }

  return (
    <article className="bg-white border border-[#e0e9e7] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#d9eeea] text-[#12554e] rounded-xl grid place-items-center text-2xl">{icon}</div>
        <div>
          <Link href={`/transporter/${id}`} className="font-bold hover:underline">{name}</Link>
          <div className="text-sm text-[#698084]">⭐ {rating} · {reviews} avis</div>
        </div>
      </div>
      <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full ${available ? "bg-[#e3f6e8] text-[#23754a]" : "bg-gray-100 text-gray-500"}`}>
        ● {available ? "Disponible" : "Indisponible"}
      </span>
      <div className="text-sm text-[#425d61] leading-relaxed">{details}</div>
      <div className="text-lg font-extrabold text-[#155e58]">{price}</div>

      <div className="mt-auto flex gap-2">
        <button
          disabled={!available}
          onClick={() => setOpen(true)}
          className="flex-1 bg-[#176c64] text-white rounded-lg py-2.5 font-semibold disabled:opacity-50 text-sm"
        >
          💬 Messagerie
        </button>
        <button
          disabled={!available}
          onClick={handleWhatsApp}
          className="flex-1 bg-[#25D366] text-white rounded-lg py-2.5 font-semibold disabled:opacity-50 text-sm"
        >
          🟢 WhatsApp
        </button>
      </div>

      <RequestDialog open={open} onClose={() => setOpen(false)} transporterName={name} />
    </article>
  );
}
