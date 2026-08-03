"use client";

import { useEffect, useState } from "react";

type Campaign = { id: string; subject: string; tagFilter: string | null; sentCount: number; sentAt: string };

export function MarketingManager({ gate }: { gate: string }) {
  const [tags, setTags] = useState<string[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch(`/${gate}/api/marketing`)
      .then((res) => res.json())
      .then((data) => {
        setTags(data.tags ?? []);
        setTotalCustomers(data.totalCustomers ?? 0);
        setCampaigns(data.campaigns ?? []);
      });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/${gate}/api/marketing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: String(form.get("subject")),
        body: String(form.get("body")),
        tagFilter,
      }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setMessage(data.error ?? "Erreur d'envoi.");
      return;
    }
    setMessage(`Envoyé à ${data.sentCount} / ${data.targeted} client(s).`);
    (e.target as HTMLFormElement).reset();
    load();
  }

  return (
    <div>
      <p className="mb-6 text-sm text-[#6C757D]">
        {totalCustomers} compte(s) client au total. Cible un tag précis pour
        segmenter, ou laisse vide pour envoyer à tous les clients inscrits.
      </p>

      <form onSubmit={handleSubmit} className="admin-card mb-8 space-y-3 p-4">
        <div>
          <label htmlFor="tagFilter" className="mb-1 block text-xs font-medium text-[#6C757D]">
            Cibler un tag (optionnel)
          </label>
          <select
            id="tagFilter"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
          >
            <option value="">Tous les clients</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <input name="subject" placeholder="Objet de l'email" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
        <textarea name="body" placeholder="Contenu du message" required rows={6} className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
        <button
          type="submit"
          disabled={sending}
          className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {sending ? "Envoi en cours..." : "Envoyer la campagne"}
        </button>
      </form>

      {message && <p className="mb-4 text-sm text-[#2F6F4F]">{message}</p>}

      <h2 className="mb-3 text-sm font-semibold">Campagnes envoyées</h2>
      <div className="space-y-2">
        {campaigns.map((c) => (
          <div key={c.id} className="admin-card flex items-center justify-between p-3 text-sm">
            <span>
              {c.subject} {c.tagFilter && <span className="text-[#6C757D]">— tag: {c.tagFilter}</span>}
            </span>
            <span className="text-xs text-[#6C757D]">
              {c.sentCount} envoyés · {new Date(c.sentAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        ))}
        {campaigns.length === 0 && <p className="text-sm text-[#6C757D]">Aucune campagne envoyée.</p>}
      </div>
    </div>
  );
}
