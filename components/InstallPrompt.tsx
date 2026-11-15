"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !deferred) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#103c40] text-white rounded-2xl p-4 shadow-xl z-50 flex items-center gap-3">
      <div className="flex-1">
        <div className="font-bold text-sm">Installer YobbuGo</div>
        <div className="text-xs opacity-80">Ajoute l’app sur ton écran d’accueil</div>
      </div>
      <button
        onClick={async () => {
          deferred.prompt();
          await deferred.userChoice;
          setShow(false);
        }}
        className="bg-[#f5c65d] text-[#132a35] font-bold text-sm px-4 py-2 rounded-xl"
      >
        Installer
      </button>
      <button onClick={() => setShow(false)} className="text-white/60 text-lg leading-none">
        ×
      </button>
    </div>
  );
}
