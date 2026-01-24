"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie-consent-accepted");
      if (!consent) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("cookie-consent-accepted", "true");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="premium-card rounded-2xl p-6 sm:p-8 max-w-lg w-[92%] bg-white shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Nous respectons votre vie privée</h3>
        <p className="text-gray-700 mb-4">
          Nous utilisons des cookies pour améliorer votre expérience, analyser l'utilisation du site
          et proposer du contenu pertinent. En cliquant sur « Accepter », vous consentez à l'utilisation de tous les cookies.
        </p>
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <Link href="/privacy" className="text-purple-600 hover:text-purple-800 font-semibold">Vie privée</Link>
          <span className="text-gray-300">|</span>
          <Link href="/cookies" className="text-purple-600 hover:text-purple-800 font-semibold">Cookies</Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-purple-600 hover:text-purple-800 font-semibold">Conditions</Link>
        </div>
        <div className="flex gap-3">
          <button
            onClick={accept}
            className="premium-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            Accepter
          </button>
          <button
            onClick={() => setShow(false)}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
          >
            Continuer sans accepter
          </button>
        </div>
      </div>
    </div>
  );
}
