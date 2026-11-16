"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/platform";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [manual, setManual] = useState(false);
  const native = isNativeApp();

  useEffect(() => {
    if (native) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Sur iOS ou si le prompt n'arrive pas, montrer les instructions manuelles après 3s
    const t = setTimeout(() => {
      if (!deferred) setManual(true);
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(t);
    };
  }, [deferred, native]);

  if (native) return null;

  if (deferred && show) {
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

  if (manual) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#103c40] text-white rounded-2xl p-4 shadow-xl z-50">
        <div className="font-bold text-sm mb-1">Installer YobbuGo</div>
        <p className="text-xs opacity-90 mb-3">
          {isIOS
            ? "Sur iPhone : touche Partager → « Sur l’écran d’accueil »"
            : "Sur Android : menu Chrome (⋮) → « Ajouter à l’écran d’accueil » ou « Installer l’application »"}
        </p>
        <button
          onClick={() => setManual(false)}
          className="text-xs bg-white/10 px-3 py-1 rounded-lg"
        >
          Fermer
        </button>
      </div>
    );
  }

  return null;
}
