"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StarRating } from "@/components/public/StarRating";
import { Honeypot } from "@/components/public/Honeypot";

type ReviewData = {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
};

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function load() {
    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setAvgRating(data.avgRating ?? 0);
      });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial des avis au montage
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || photos.length >= 3) return;

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-review-photo", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setUploadError(data.error ?? "Erreur d'upload.");
      return;
    }
    setPhotos((prev) => [...prev, data.url]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        authorName: String(form.get("authorName")),
        rating: Number(form.get("rating")),
        comment: String(form.get("comment")),
        images: photos,
        website: String(form.get("website") ?? ""),
      }),
    });
    setSubmitted(true);
    setShowForm(false);
    setPhotos([]);
  }

  return (
    <section className="mt-16 border-t border-[#E9ECEF] pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Avis clients</h2>
          {reviews.length > 0 && <StarRating rating={avgRating} count={reviews.length} />}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg border border-[#E9ECEF] px-4 py-2 text-sm font-medium"
        >
          Laisser un avis
        </button>
      </div>

      {submitted && (
        <p className="mb-4 text-sm text-[#2F6F4F]">
          Merci ! Ton avis sera visible après validation.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-xl border border-[#E9ECEF] p-4">
          <Honeypot />
          <label htmlFor="review-author" className="sr-only">Ton nom</label>
          <input
            id="review-author"
            name="authorName"
            placeholder="Ton nom"
            required
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
          />
          <label htmlFor="review-rating" className="sr-only">Note</label>
          <select id="review-rating" name="rating" defaultValue="5" className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} étoile{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <label htmlFor="review-comment" className="sr-only">Ton avis sur ce produit</label>
          <textarea
            id="review-comment"
            name="comment"
            placeholder="Ton avis sur ce produit"
            required
            rows={3}
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm"
          />

          <div>
            <label htmlFor="review-photo" className="mb-1 block text-xs font-medium text-[#6C757D]">
              Ajouter une photo (optionnel, max 3)
            </label>
            {photos.length < 3 && (
              <input id="review-photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
            )}
            {uploading && <p className="text-xs text-[#6C757D]">Envoi...</p>}
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            {photos.length > 0 && (
              <div className="mt-2 flex gap-2">
                {photos.map((url) => (
                  <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <Image src={url} alt="Photo jointe" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="rounded-lg bg-[#FF523B] px-4 py-2 text-sm font-medium text-white">
            Envoyer
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-[#6C757D]">Aucun avis pour l&apos;instant.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-[#E9ECEF] p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{r.authorName}</span>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-sm text-[#6C757D]">{r.comment}</p>
              {r.images?.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {r.images.map((url) => (
                    <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg">
                      <Image src={url} alt="Photo du client" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
