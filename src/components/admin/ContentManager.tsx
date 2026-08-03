"use client";

import { useEffect, useState } from "react";

type Tab = "reviews" | "testimonials" | "posts" | "categories" | "promo";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  approved: boolean;
  product: { name: string };
};

type Testimonial = {
  id: string;
  authorName: string;
  role: string | null;
  quote: string;
  rating: number;
  approved: boolean;
};

type Post = {
  id: string;
  title: string;
  excerpt: string;
  published: boolean;
};

type Category = { id: string; name: string; slug: string };

export function ContentManager({ gate }: { gate: string }) {
  const [tab, setTab] = useState<Tab>("reviews");

  const tabs: { key: Tab; label: string }[] = [
    { key: "reviews", label: "Avis produits" },
    { key: "testimonials", label: "Témoignages" },
    { key: "posts", label: "Blog" },
    { key: "categories", label: "Catégories" },
    { key: "promo", label: "Codes promo" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {tabs.map((tItem) => (
          <button
            key={tItem.key}
            onClick={() => setTab(tItem.key)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tab === tItem.key ? "bg-[#2F6F4F] text-white" : "border border-[#E9ECEF]"
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {tab === "reviews" && <ReviewsTab gate={gate} />}
      {tab === "testimonials" && <TestimonialsTab gate={gate} />}
      {tab === "posts" && <PostsTab gate={gate} />}
      {tab === "categories" && <CategoriesTab gate={gate} />}
      {tab === "promo" && <PromoTab gate={gate} />}
    </div>
  );
}

function ReviewsTab({ gate }: { gate: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  function load() {
    fetch(`/${gate}/api/content/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleApproved(id: string, approved: boolean) {
    await fetch(`/${gate}/api/content/reviews`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/${gate}/api/content/reviews?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-3">
      {reviews.length === 0 && <p className="text-sm text-[#6C757D]">Aucun avis pour l&apos;instant.</p>}
      {reviews.map((r) => (
        <div key={r.id} className="admin-card flex items-start justify-between p-4">
          <div>
            <p className="text-sm font-medium">
              {r.authorName} — {r.product.name} ({r.rating}★)
            </p>
            <p className="text-sm text-[#6C757D]">{r.comment}</p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button
              onClick={() => toggleApproved(r.id, !r.approved)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                r.approved ? "bg-[#F8F9FA] text-[#6C757D]" : "bg-[#2F6F4F] text-white"
              }`}
            >
              {r.approved ? "Masquer" : "Approuver"}
            </button>
            <button onClick={() => remove(r.id)} className="text-xs text-red-600 underline">
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialsTab({ gate }: { gate: string }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetch(`/${gate}/api/content/testimonials`)
      .then((res) => res.json())
      .then((data) => setTestimonials(data.testimonials ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/${gate}/api/content/testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: String(form.get("authorName")),
        role: String(form.get("role") ?? ""),
        quote: String(form.get("quote")),
        rating: Number(form.get("rating")),
      }),
    });
    setShowForm(false);
    load();
  }

  async function toggleApproved(id: string, approved: boolean) {
    await fetch(`/${gate}/api/content/testimonials`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/${gate}/api/content/testimonials?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-4 rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
      >
        + Ajouter un témoignage
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6 grid gap-3 p-4 md:grid-cols-2">
          <input name="authorName" placeholder="Nom du client" required className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <input name="role" placeholder="Rôle / contexte (optionnel)" className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <textarea name="quote" placeholder="Citation" required className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm md:col-span-2" />
          <select name="rating" defaultValue="5" className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} étoiles</option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white md:col-span-2">
            Enregistrer
          </button>
        </form>
      )}

      <div className="space-y-3">
        {testimonials.map((t) => (
          <div key={t.id} className="admin-card flex items-start justify-between p-4">
            <div>
              <p className="text-sm font-medium">{t.authorName} {t.role && `— ${t.role}`}</p>
              <p className="text-sm text-[#6C757D]">&quot;{t.quote}&quot;</p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                onClick={() => toggleApproved(t.id, !t.approved)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  t.approved ? "bg-[#F8F9FA] text-[#6C757D]" : "bg-[#2F6F4F] text-white"
                }`}
              >
                {t.approved ? "Dépublier" : "Publier"}
              </button>
              <button onClick={() => remove(t.id)} className="text-xs text-red-600 underline">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostsTab({ gate }: { gate: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetch(`/${gate}/api/content/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/${gate}/api/content/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title")),
        excerpt: String(form.get("excerpt")),
        content: String(form.get("content")),
        published: form.get("published") === "on",
      }),
    });
    setShowForm(false);
    load();
  }

  async function togglePublished(id: string, published: boolean) {
    await fetch(`/${gate}/api/content/posts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/${gate}/api/content/posts?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-4 rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
      >
        + Nouvel article
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6 space-y-3 p-4">
          <input name="title" placeholder="Titre" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <input name="excerpt" placeholder="Résumé court" required className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <textarea name="content" placeholder="Contenu de l'article" required rows={6} className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" /> Publier immédiatement
          </label>
          <button type="submit" className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white">
            Enregistrer
          </button>
        </form>
      )}

      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="admin-card flex items-start justify-between p-4">
            <div>
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-sm text-[#6C757D]">{p.excerpt}</p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                onClick={() => togglePublished(p.id, !p.published)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  p.published ? "bg-[#F8F9FA] text-[#6C757D]" : "bg-[#2F6F4F] text-white"
                }`}
              >
                {p.published ? "Dépublier" : "Publier"}
              </button>
              <button onClick={() => remove(p.id)} className="text-xs text-red-600 underline">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromoTab({ gate }: { gate: string }) {
  type Promo = {
    id: string;
    code: string;
    discountType: "PERCENT" | "FIXED";
    discountValue: number;
    active: boolean;
    usageCount: number;
    usageLimit: number | null;
  };

  const [codes, setCodes] = useState<Promo[]>([]);
  const [showForm, setShowForm] = useState(false);

  function load() {
    fetch(`/${gate}/api/content/promo`)
      .then((res) => res.json())
      .then((data) => setCodes(data.codes ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`/${gate}/api/content/promo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: String(form.get("code")),
        discountType: String(form.get("discountType")),
        discountValue: Number(form.get("discountValue")),
        usageLimit: form.get("usageLimit") ? Number(form.get("usageLimit")) : null,
      }),
    });
    setShowForm(false);
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/${gate}/api/content/promo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/${gate}/api/content/promo?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-4 rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white"
      >
        + Nouveau code promo
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card mb-6 grid gap-3 p-4 md:grid-cols-2">
          <input name="code" placeholder="Code (ex. BIENVENUE10)" required className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <select name="discountType" className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm">
            <option value="PERCENT">Pourcentage (%)</option>
            <option value="FIXED">Montant fixe ($)</option>
          </select>
          <input name="discountValue" type="number" step="0.01" placeholder="Valeur (ex. 10)" required className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <input name="usageLimit" type="number" placeholder="Limite d'utilisation (optionnel)" className="rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white md:col-span-2">
            Créer
          </button>
        </form>
      )}

      <div className="space-y-2">
        {codes.map((c) => (
          <div key={c.id} className="admin-card flex items-center justify-between p-3 text-sm">
            <span>
              <strong>{c.code}</strong> — {c.discountType === "PERCENT" ? `${c.discountValue}%` : `$${(c.discountValue / 100).toFixed(2)}`}
              {" · "}
              {c.usageCount}
              {c.usageLimit ? `/${c.usageLimit}` : ""} utilisations
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(c.id, !c.active)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  c.active ? "bg-[#F8F9FA] text-[#6C757D]" : "bg-[#2F6F4F] text-white"
                }`}
              >
                {c.active ? "Désactiver" : "Activer"}
              </button>
              <button onClick={() => remove(c.id)} className="text-xs text-red-600 underline">
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {codes.length === 0 && <p className="text-sm text-[#6C757D]">Aucun code promo créé.</p>}
      </div>
    </div>
  );
}

function CategoriesTab({ gate }: { gate: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");

  function load() {
    fetch(`/${gate}/api/content/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch(`/${gate}/api/content/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/${gate}/api/content/categories?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la catégorie (ex. Téléphones)"
          className="flex-1 rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-[#2F6F4F] px-4 py-2 text-sm font-medium text-white">
          Ajouter
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="admin-card flex items-center justify-between p-3 text-sm">
            <span>{c.name}</span>
            <button onClick={() => remove(c.id)} className="text-xs text-red-600 underline">
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
