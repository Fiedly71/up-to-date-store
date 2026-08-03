export type ShippingZone = {
  slug: string;
  label: string;
  fee: number; // cents
};

// Structure de départ — à ajuster avec tes vrais frais de livraison par
// zone. Simple fichier de config, pas besoin de toucher la base de données
// pour changer un tarif.
export const shippingZones: ShippingZone[] = [
  { slug: "cap-haitien", label: "Cap-Haïtien (retrait ou livraison locale)", fee: 0 },
  { slug: "nord", label: "Reste du département du Nord", fee: 500 },
  { slug: "autre", label: "Autre département", fee: 1500 },
];

export function getShippingZone(slug: string) {
  return shippingZones.find((z) => z.slug === slug) ?? shippingZones[0];
}
