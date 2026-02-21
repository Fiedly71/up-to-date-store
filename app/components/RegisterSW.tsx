"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";

export default function RegisterSW() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Check if already running as installed PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return; // Don't show banner if already installed

    // Detect iOS (no beforeinstallprompt on Safari)
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Show banner after a short delay every visit
    const timer = setTimeout(() => setShowBanner(true), 2000);

    // Listen for beforeinstallprompt (Chrome, Edge, Samsung, etc.)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] animate-slide-down">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">Installez Up-to-Date Store</p>
            {isIOS ? (
              <p className="text-xs text-white/80 leading-tight">
                Appuyez sur <span className="inline-block mx-0.5">⬆️</span> puis &quot;Sur l&apos;écran d&apos;accueil&quot;
              </p>
            ) : (
              <p className="text-xs text-white/80 leading-tight">Accès rapide depuis votre écran d&apos;accueil</p>
            )}
          </div>
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-50 transition flex-shrink-0"
            >
              <Download size={16} />
              Installer
            </button>
          )}
          <button
            onClick={() => setShowBanner(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition flex-shrink-0"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
