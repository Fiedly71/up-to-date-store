"use client";

import { useEffect, useState } from "react";

type Variant = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  priceDiff: number;
  colorHex: string | null;
  image: string | null;
};

export function VariantManager({ gate, productId }: { gate: string; productId: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetch(`/${gate}/api/variants?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => setVariants(data.variants ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial des variantes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/${gate}/api/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        name: String(form.get("name")),
        sku: String(form.get("sku")),
        stock: Number(form.get("stock") ?? 0),
        priceDiff: Number(form.get("priceDiff") ?? 0),
        colorHex: String(form.get("colorHex") ?? ""),
        image: String(form.get("image") ?? ""),
      }),
    });
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/${gate}/api/variants?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="rounded-lg border border-[#E9ECEF] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-[#6C757D]">
          Variantes (couleur, stockage...) — {variants.length}
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-[#2F6F4F] underline"
        >
          + Ajouter une variante
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 grid gap-2 rounded-lg bg-[#F8F9FA] p-3 md:grid-cols-2">
          <input name="name" placeholder="Nom (ex. Noir / 128GB)" required className="rounded-lg border border-[#E9ECEF] px-2 py-1.5 text-sm" />
          <input name="sku" placeholder="SKU variante" required className="rounded-lg border border-[#E9ECEF] px-2 py-1.5 text-sm" />
          <input name="stock" type="number" placeholder="Stock" className="rounded-lg border border-[#E9ECEF] px-2 py-1.5 text-sm" />
          <input name="priceDiff" type="number" step="0.01" placeholder="Écart de prix ($, peut être négatif)" className="rounded-lg border border-[#E9ECEF] px-2 py-1.5 text-sm" />
          <div className="flex items-center gap-2">
            <label htmlFor={`color-${productId}`} className="text-xs text-[#6C757D]">Couleur</label>
            <input id={`color-${productId}`} name="colorHex" type="color" defaultValue="#1A1A1A" className="h-8 w-12 rounded border border-[#E9ECEF]" />
          </div>
          <input name="image" placeholder="URL image spécifique (optionnel)" className="rounded-lg border border-[#E9ECEF] px-2 py-1.5 text-sm" />
          <button type="submit" className="rounded-lg bg-[#2F6F4F] px-3 py-1.5 text-xs font-medium text-white md:col-span-2">
            Ajouter
          </button>
        </form>
      )}

      <div className="space-y-1">
        {variants.map((v) => (
          <div key={v.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              {v.colorHex && (
                <span className="h-4 w-4 rounded-full border border-[#E9ECEF]" style={{ backgroundColor: v.colorHex }} />
              )}
              {v.name} — stock {v.stock}
              {v.priceDiff !== 0 && ` (${v.priceDiff > 0 ? "+" : ""}$${(v.priceDiff / 100).toFixed(2)})`}
            </span>
            <button onClick={() => remove(v.id)} className="text-xs text-red-600 underline">
              Supprimer
            </button>
          </div>
        ))}
        {variants.length === 0 && (
          <p className="text-xs text-[#6C757D]">Aucune variante — le produit se vend tel quel.</p>
        )}
      </div>
    </div>
  );
}
