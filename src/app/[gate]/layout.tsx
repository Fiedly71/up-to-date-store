import { notFound } from "next/navigation";
import type { Metadata } from "next";
import "@/app/admin-theme.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gate: string }>;
}): Promise<Metadata> {
  const { gate } = await params;
  return {
    title: "UpDate — Espace interne",
    manifest: `/${gate}/manifest.webmanifest`,
    robots: { index: false, follow: false },
  };
}

export default async function GateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gate: string }>;
}) {
  const { gate } = await params;

  // Si le segment d'URL ne correspond pas exactement au slug secret
  // défini dans ADMIN_GATE_SLUG, on renvoie une 404 classique.
  // Rien ne distingue cette page d'une vraie page introuvable.
  if (!process.env.ADMIN_GATE_SLUG || gate !== process.env.ADMIN_GATE_SLUG) {
    notFound();
  }

  return <div className="admin-shell min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">{children}</div>;
}
