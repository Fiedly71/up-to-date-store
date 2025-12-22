"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, MessageCircle, ChevronLeft, ShoppingBag } from 'lucide-react';

export default function PanierPage() {
  const { cart, removeFromCart } = useCart();

  const sendWhatsAppOrder = () => {
    let message = "*DEMANDE DE DISPONIBILITÉ - UP-TO-DATE STORE*\n";
    message += "------------------------------------------\n\n";
    
    cart.forEach((item, index) => {
      message += `*${index + 1}. ${item.name}*\n`;
      message += `   Quantité : ${item.quantity}\n\n`;
    });

    message += "------------------------------------------\n";
    message += "Pouvez-vous me donner les prix et la disponibilité de ces articles ?";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/50932836938?text=${encodedMessage}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
          <ShoppingBag size={80} className="text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre liste est vide</h1>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all inline-block mt-4">
            Parcourir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
            <ChevronLeft size={20} /> Retour
          </Link>
          <h1 className="text-2xl font-black text-gray-900 uppercase">Ma Sélection</h1>
        </div>

        <div className="space-y-4 mb-10">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <Image 
  src={item.image || "/UPTODATE%20logo.jpg"} 
  alt={item.name} 
  fill 
  className="object-cover" 
/>
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                <p className="text-gray-500 text-sm italic">Quantité: {item.quantity}</p>
              </div>

              <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky bottom-6 text-center">
          <p className="text-gray-600 mb-4">Cliquez ci-dessous pour m'envoyer votre sélection et recevoir un devis.</p>
          <button 
            onClick={sendWhatsAppOrder}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-green-200"
          >
            <MessageCircle size={24} fill="currentColor" />
            Demander le prix sur WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}