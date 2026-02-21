import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from './context/CartContext'; // Importe le nouveau fichier
import AuthCallbackGuard from './components/AuthCallbackGuard';
import Link from "next/link";
import { ShoppingCart, Instagram } from "lucide-react";
import CartBadge from './components/CartBadge';
import { Analytics } from "@vercel/analytics/react";
import CookieConsent from "@/app/components/CookieConsent";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Up-to-Date Store",
  description: "Vente de produits électroniques et service de shipping rapide vers Haïti.",
  icons: {
    icon: '/UPTODATE%20logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthCallbackGuard />
        <CartProvider>
        <div>
          {children}
          <Analytics />
          <CookieConsent />

          {/* Floating Instagram Button (site-wide) */}
          <a
            href="https://instagram.com/uptodate.electronic"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="fixed bottom-6 right-6 z-50 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
          >
            <Instagram size={22} />
          </a>
        </div>
        
        </CartProvider>
        {/* Icône Panier Flottante */}

      </body>
    </html>
  );
}
