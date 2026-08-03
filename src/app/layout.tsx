import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/components/public/CartContext";
import { WishlistProvider } from "@/components/public/WishlistContext";
import { LangProvider } from "@/components/public/LangContext";
import { WhatsAppFloatingButton } from "@/components/public/WhatsAppFloatingButton";
import { AnalyticsScripts } from "@/components/public/AnalyticsScripts";

export const metadata: Metadata = {
  title: "UpDate — Tech & Digital Solutions",
  description:
    "Boutique high-tech et développement web/app sur mesure — Cap-Haïtien, Haïti.",
  manifest: "/site-manifest.json",
  appleWebApp: {
    capable: true,
    title: "UpDate",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/site-icon-192.png",
    apple: "/icons/site-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF523B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-[#1A1A1A]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#1A1A1A] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Aller au contenu principal
        </a>
        <AnalyticsScripts />
        <LangProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <WhatsAppFloatingButton />
            </WishlistProvider>
          </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
