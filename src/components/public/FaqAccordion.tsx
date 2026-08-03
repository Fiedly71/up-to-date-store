"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Carte bancaire via Stripe en ligne, et Cash (HTG/USD), Moncash ou carte au comptoir physique.",
  },
  {
    q: "Livrez-vous en dehors du Cap-Haïtien ?",
    a: "Oui, on livre partout en Haïti. Les délais varient selon la zone — contacte-nous sur WhatsApp pour un délai précis.",
  },
  {
    q: "Puis-je payer un acompte pour un produit cher ?",
    a: "Oui, certains produits proposent un paiement en 2 fois (50% à la commande, 50% à la livraison).",
  },
  {
    q: "Que se passe-t-il si mon produit tombe en panne ?",
    a: "Tous nos produits neufs sont couverts par une garantie (voir notre page Garantie & Support). Contacte-nous sur WhatsApp avec ton numéro de commande.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="mb-8 text-2xl font-semibold">Questions fréquentes</h2>
      <div className="space-y-2">
        {faqs.map((item, i) => (
          <div key={i} className="rounded-xl border border-[#E9ECEF]">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
            >
              {item.q}
              <span className="text-[#FF523B]">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <p className="border-t border-[#E9ECEF] px-4 py-3 text-sm text-[#6C757D]">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
