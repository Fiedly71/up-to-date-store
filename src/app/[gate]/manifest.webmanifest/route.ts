import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;

  if (!process.env.ADMIN_GATE_SLUG || gate !== process.env.ADMIN_GATE_SLUG) {
    return new NextResponse(null, { status: 404 });
  }

  const manifest = {
    name: "UpDate Comptoir",
    short_name: "UpDate POS",
    description: "Système de caisse interne UpDate Tech & Digital Solutions",
    start_url: `/${gate}/dashboard`,
    scope: `/${gate}/`,
    display: "standalone",
    background_color: "#F8F9FA",
    theme_color: "#2F6F4F",
    icons: [
      { src: "/icons/pos-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/pos-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
