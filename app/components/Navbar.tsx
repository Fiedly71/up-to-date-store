import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/UPTODATE%20logo.jpg" alt="UPTOdate logo" width={40} height={40} className="rounded-md object-contain" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Up-to-date Electronic Store</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">Accueil</Link>
            <Link href="/produits" className="text-gray-700 hover:text-gray-900 font-medium">Boutique</Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium">À Propos</Link>
            <Link href="/restrictions" className="text-gray-700 hover:text-red-600 font-medium">Produits Interdits</Link>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Tarifs</a>
          </div>
        </div>

        <a
          href="https://wa.me/50932836938"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-2 border-green-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">Nous contacter</span>
        </a>
      </div>
    </nav>
  );
}
