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
  whatsappUrl?: string | null;
};

export function TransporterCard({ id, name, rating, reviews, available, details, price, icon, whatsappUrl }: Props) {
  const [open, setOpen] = useState(false);

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
        {available && whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] text-white rounded-lg py-2.5 font-semibold text-center text-sm"
          >
            🟢 WhatsApp
          </a>
        ) : (
          <button disabled className="flex-1 bg-gray-200 text-gray-500 rounded-lg py-2.5 font-semibold text-sm">
            WhatsApp non disponible
          </button>
        )}
      </div>

      <RequestDialog open={open} onClose={() => setOpen(false)} transporterName={name} />
    </article>
  );
}
