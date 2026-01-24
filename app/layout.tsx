import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from './context/CartContext'; // Importe le nouveau fichier
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import CartBadge from './components/CartBadge';
import { Analytics } from "@vercel/analytics/react";
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
        <CartProvider>
        {/* Announcement Bar (site-wide) */}
        <div className="w-full bg-blue-900 text-white text-sm py-1 text-center">
          📦 Prochain départ des USA : Vendredi prochain ! | 📲 Devis gratuit via WhatsApp.
        </div>

        <div className="pt-4">
          {children}
          <Analytics />

          {/* Floating WhatsApp Button (site-wide) */}
          <a
            href="https://wa.me/50932836938"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-message-circle">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.2 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-4.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"></path>
            </svg>
          </a>
        </div>
        
        </CartProvider>
        {/* Icône Panier Flottante */}

      </body>
    </html>
  );
}
