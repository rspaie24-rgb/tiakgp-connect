"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  transporterName: string;
};

export function RequestDialog({ open, onClose, transporterName }: Props) {
  const [sent, setSent] = useState(false);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">Demander un transport</h2>
        <p className="text-sm mb-4">Transporteur : {transporterName}</p>

        {sent ? (
          <p className="text-green-600 font-semibold">Demande simulée envoyée !</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input required placeholder="Votre nom" className="w-full border rounded-lg p-3" />
            <input required placeholder="Téléphone ou e-mail" className="w-full border rounded-lg p-3" />
            <textarea required placeholder="Détails du colis (lieu, destination, poids…)" className="w-full border rounded-lg p-3 min-h-[90px]" />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-[#176c64] text-white rounded-lg py-2.5 font-semibold">Envoyer</button>
              <button type="button" onClick={onClose} className="flex-1 bg-[#eaf1ef] text-[#234] rounded-lg py-2.5 font-semibold">Annuler</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
