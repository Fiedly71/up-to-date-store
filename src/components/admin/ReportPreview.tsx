"use client";

import { useEffect, useState } from "react";

export function ReportPreview({ gate }: { gate: string }) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/${gate}/api/report`)
      .then((res) => res.json())
      .then((data) => setHtml(data.html ?? ""))
      .finally(() => setLoading(false));
  }, [gate]);

  async function sendNow() {
    setSending(true);
    setMessage(null);
    const res = await fetch(`/${gate}/api/report`, { method: "POST" });
    setMessage(res.ok ? "Rapport envoyé par email." : "Erreur d'envoi (clé Resend manquante ?).");
    setSending(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#6C757D]">
          Aperçu du rapport calculé en direct pour aujourd&apos;hui.
        </p>
        <button
          onClick={sendNow}
          disabled={sending}
          className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {sending ? "Envoi..." : "Envoyer maintenant par email"}
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-[#2F6F4F]">{message}</p>}

      <div className="admin-card p-6">
        {loading ? (
          <p className="text-sm text-[#6C757D]">Calcul en cours...</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>

      <p className="mt-4 text-xs text-[#6C757D]">
        L&apos;envoi automatique quotidien (23:59) est configuré via Vercel Cron
        (voir <code>vercel.json</code>) et nécessite <code>CRON_SECRET</code> et{" "}
        <code>RESEND_API_KEY</code> en production.
      </p>
    </div>
  );
}
