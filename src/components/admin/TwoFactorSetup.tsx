"use client";

import { useState } from "react";

export function TwoFactorSetup({ gate, initiallyEnabled }: { gate: string; initiallyEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function startSetup() {
    const res = await fetch(`/${gate}/api/2fa/setup`, { method: "POST" });
    const data = await res.json();
    setQrCode(data.qrCode);
    setSecret(data.secret);
  }

  async function confirmEnable() {
    const res = await fetch(`/${gate}/api/2fa/enable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Erreur.");
      return;
    }
    setEnabled(true);
    setQrCode(null);
    setMessage("2FA activée !");
  }

  async function disable() {
    await fetch(`/${gate}/api/2fa/disable`, { method: "POST" });
    setEnabled(false);
    setMessage("2FA désactivée.");
  }

  return (
    <div className="admin-card p-6">
      <h2 className="mb-1 text-sm font-semibold">Authentification à deux facteurs (2FA)</h2>
      <p className="mb-4 text-xs text-[#6C757D]">
        Ajoute une couche de sécurité supplémentaire à ton compte avec une
        application comme Google Authenticator ou Authy.
      </p>

      {message && <p className="mb-4 text-sm text-[#2F6F4F]">{message}</p>}

      {enabled ? (
        <div>
          <p className="mb-3 text-sm text-[#2F6F4F]">✓ 2FA activée sur ce compte.</p>
          <button
            onClick={disable}
            className="rounded-lg border border-[#E9ECEF] px-4 py-2 text-sm font-medium"
          >
            Désactiver la 2FA
          </button>
        </div>
      ) : qrCode ? (
        <div>
          <p className="mb-3 text-sm">
            Scanne ce QR code avec ton application d&apos;authentification, puis
            entre le code généré :
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- QR code en data URL, next/image inutile ici */}
          <img src={qrCode} alt="QR code 2FA" className="mb-3 h-40 w-40" />
          {secret && (
            <p className="mb-3 text-xs text-[#6C757D]">
              Ou entre ce code manuellement : <code>{secret}</code>
            </p>
          )}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code à 6 chiffres"
            maxLength={6}
            className="mb-3 w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
          />
          <button
            onClick={confirmEnable}
            className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
          >
            Confirmer et activer
          </button>
        </div>
      ) : (
        <button
          onClick={startSetup}
          className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
        >
          Activer la 2FA
        </button>
      )}
    </div>
  );
}
