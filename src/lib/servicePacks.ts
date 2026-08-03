export type ServicePack = {
  slug: string;
  name: string;
  /** "FIXED_PACK" = prix fixe, paiement Stripe direct après le brief.
   *  "CUSTOM_QUOTE" = pas de prix fixe, le brief part en demande de devis
   *  (pas de paiement immédiat) — pour les gros projets sur mesure. */
  kind: "FIXED_PACK" | "CUSTOM_QUOTE";
  price: number; // en cents — ignoré si kind = CUSTOM_QUOTE
  description: string;
  features: string[];
};

// Structure de départ — à remplacer par la vraie grille tarifaire
// migrée de gd-digital-studio.space (noms, prix, contenu réels).
export const servicePacks: ServicePack[] = [
  {
    slug: "site-vitrine",
    name: "Pack Site Vitrine",
    kind: "FIXED_PACK",
    price: 0,
    description: "À compléter",
    features: ["À compléter", "À compléter"],
  },
  {
    slug: "ecommerce",
    name: "Pack E-commerce",
    kind: "FIXED_PACK",
    price: 0,
    description: "À compléter",
    features: ["À compléter", "À compléter"],
  },
  {
    slug: "projet-sur-mesure",
    name: "Projet sur mesure (app, dashboard, gros site)",
    kind: "CUSTOM_QUOTE",
    price: 0,
    description:
      "Pour les projets qui sortent des packs standards. On étudie ton besoin et on revient vers toi avec un devis personnalisé — aucun paiement à cette étape.",
    features: [
      "Cahier des charges détaillé",
      "Devis sous 48h",
      "Accompagnement de A à Z",
    ],
  },
];

export function getServicePack(slug: string) {
  return servicePacks.find((p) => p.slug === slug);
}
