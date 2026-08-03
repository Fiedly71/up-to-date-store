import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Les URLs d'images de produits viennent de Gui (hébergement externe
    // variable) — on autorise tout HTTPS plutôt que de lister des domaines
    // précis. Si un hébergeur d'images bloque le hotlinking, remplace par
    // des domaines explicites ici.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
