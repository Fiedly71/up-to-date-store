"use client";

import { useState } from "react";

export function BackupExportButton({ gate }: { gate: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/${gate}/api/backup`);
      if (!res.ok) throw new Error("Échec de l'export.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `updatetech-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-card p-6">
      <h2 className="mb-1 text-sm font-semibold">Sauvegarde des données</h2>
      <p className="mb-4 text-xs text-[#6C757D]">
        Télécharge un export JSON complet (produits, commandes, avis, blog,
        codes promo...). À utiliser en complément des sauvegardes
        automatiques de ton hébergeur de base de données (Supabase/Neon) —
        pas à la place. Un export est aussi envoyé automatiquement par email
        chaque dimanche.
      </p>
      <button
        onClick={handleExport}
        disabled={loading}
        className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Export en cours..." : "Télécharger une sauvegarde maintenant"}
      </button>
    </div>
  );
}
