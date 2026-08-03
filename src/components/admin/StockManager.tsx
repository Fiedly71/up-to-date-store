"use client";

import { useEffect, useState } from "react";
import { VariantManager } from "@/components/admin/VariantManager";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockAt: number;
  description?: string | null;
  categoryId?: string | null;
  images?: string[];
};

type Category = { id: string; name: string };

export function StockManager({ gate }: { gate: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`/${gate}/api/products`),
      fetch(`/${gate}/api/content/categories`),
    ]);
    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();
    setProducts(productsData.products ?? []);
    setCategories(categoriesData.categories ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial des produits au montage
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openForm(product: Product | null) {
    setEditing(product);
    setImageUrl(product?.images?.[0] ?? "");
    setUploadError(null);
    setShowForm(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/${gate}/api/upload`, { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setUploadError(data.error ?? "Erreur d'upload.");
      return;
    }
    setImageUrl(data.url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      id: editing?.id,
      name: String(form.get("name")),
      sku: String(form.get("sku")),
      price: Math.round(Number(form.get("price")) * 100),
      stock: Number(form.get("stock")),
      lowStockAt: Number(form.get("lowStockAt")),
      description: String(form.get("description") ?? ""),
      categoryId: String(form.get("categoryId") ?? "") || null,
      images: imageUrl,
    };

    const res = await fetch(`/${gate}/api/products`, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMessage(editing ? "Produit mis à jour." : "Produit ajouté.");
      setShowForm(false);
      setEditing(null);
      load();
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Erreur.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#6C757D]">
          {loading ? "Chargement..." : `${products.length} produit(s)`}
        </h2>
        <button
          onClick={() => openForm(null)}
          className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
        >
          + Ajouter un produit
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-[#2F6F4F]">{message}</p>}

      {categories.length === 0 && (
        <p className="mb-4 text-xs text-[#6C757D]">
          Astuce : crée d&apos;abord des catégories dans l&apos;onglet
          &quot;Contenu du site&quot; pour pouvoir les assigner ici, et pour
          que le filtre catégorie de la boutique soit utile.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="admin-card mb-6 grid gap-3 p-4 md:grid-cols-2"
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Nom du produit
            </label>
            <input
              id="name"
              name="name"
              defaultValue={editing?.name}
              required
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sku" className="mb-1 block text-xs font-medium text-[#6C757D]">
              SKU / référence
            </label>
            <input
              id="sku"
              name="sku"
              defaultValue={editing?.sku}
              required
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="price" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Prix ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={editing ? editing.price / 100 : undefined}
              required
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="stock" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              defaultValue={editing?.stock}
              required
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="lowStockAt" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Seuil stock bas
            </label>
            <input
              id="lowStockAt"
              name="lowStockAt"
              type="number"
              defaultValue={editing?.lowStockAt ?? 3}
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Catégorie
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={editing?.categoryId ?? ""}
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            >
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="image-file" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Photo du produit
            </label>
            <div className="flex items-center gap-3">
              <input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-sm"
              />
              {uploading && <span className="text-xs text-[#6C757D]">Envoi...</span>}
            </div>
            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
            <label htmlFor="image-url" className="mb-1 mt-2 block text-xs font-medium text-[#6C757D]">
              Ou colle une URL d&apos;image directement
            </label>
            <input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Aperçu du produit" className="mt-2 h-20 w-20 rounded-lg object-cover" />
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Description (optionnel)
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={editing?.description ?? ""}
              className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
            />
          </div>

          {editing ? (
            <div className="md:col-span-2">
              <VariantManager gate={gate} productId={editing.id} />
            </div>
          ) : (
            <p className="md:col-span-2 text-xs text-[#6C757D]">
              Enregistre d&apos;abord ce produit pour pouvoir lui ajouter des
              variantes (couleur, stockage...).
            </p>
          )}

          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[#E9ECEF] px-4 py-2 text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F9FA] text-left text-xs text-[#6C757D]">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[#E9ECEF]">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-[#6C757D]">{p.sku}</td>
                <td className="px-4 py-3">${(p.price / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {p.stock}
                  {p.stock <= p.lowStockAt && (
                    <span className="ml-2 rounded bg-[#FFF1EF] px-2 py-0.5 text-[11px] text-[#FF523B]">
                      Stock bas
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openForm(p)}
                    className="text-xs text-[#2F6F4F] underline"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#6C757D]">
                  Aucun produit. Ajoute ton premier produit ci-dessus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
