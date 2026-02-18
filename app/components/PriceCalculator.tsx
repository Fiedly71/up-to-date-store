"use client";
import { useState, useEffect } from "react";
import { getPriceBreakdown, USD_TO_GDS_RATE, formatGourdes } from "@/app/utils/pricing";
import { Calculator, DollarSign, TrendingUp, Sparkles, ArrowRight, Percent, Coins } from "lucide-react";

export default function PriceCalculator() {
  const [input, setInput] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [fee, setFee] = useState(0);
  const [feeType, setFeeType] = useState("");
  const [total, setTotal] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value.replace(/,/g, "."));
    setInput(isNaN(value) ? 0 : value);
  }

  useEffect(() => {
    if (input > 0) {
      setIsAnimating(true);
      const breakdown = getPriceBreakdown(input);
      setFee(breakdown.fee);
      setFeeType(breakdown.feeType);
      setTotal(breakdown.total);
      setResult(breakdown);
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      setResult(null);
    }
  }, [input]);

  const quickAmounts = [25, 50, 100, 200, 500];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header Icon */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
        <Calculator className="text-white" size={32} />
      </div>

      {/* Main Input */}
      <div className="w-full">
        <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
          Prix du produit (USD)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={input || ""}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full pl-12 pr-6 py-5 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-2xl font-bold text-blue-900 bg-white shadow-lg text-center transition-all duration-300"
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setInput(amount)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
              input === amount
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Results */}
      {result && (
        <div className={`w-full mt-4 transition-all duration-300 ${isAnimating ? "scale-95 opacity-70" : "scale-100 opacity-100"}`}>
          {/* Breakdown Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-yellow-300" size={20} />
              <span className="font-semibold text-blue-100">Détail du calcul</span>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-blue-200" />
                  <span className="text-blue-100">Prix du produit</span>
                </div>
                <span className="font-bold text-lg">${input.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Percent size={18} className="text-purple-200" />
                  <span className="text-purple-100">Frais ({feeType})</span>
                </div>
                <span className="font-bold text-lg text-yellow-300">+${fee.toFixed(2)}</span>
              </div>

              <div className="flex justify-center my-2">
                <ArrowRight className="text-white/50" size={24} />
              </div>

              {/* Total USD */}
              <div className="bg-white rounded-xl px-4 py-4 text-center">
                <div className="text-sm text-gray-500 mb-1">Total à payer</div>
                <div className="text-3xl font-extrabold text-blue-900">${total.toFixed(2)} USD</div>
              </div>

              {/* Total GDS */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl px-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Coins size={18} className="text-white/80" />
                  <span className="text-sm text-white/90">Équivalent en Gourdes</span>
                </div>
                <div className="text-3xl font-extrabold text-white">{formatGourdes(total)}</div>
              </div>
            </div>

            {/* Exchange Rate Note */}
            <div className="text-center text-sm text-blue-200 border-t border-white/20 pt-4">
              <TrendingUp className="inline mr-1" size={14} />
              Taux de change: <span className="font-semibold text-white">1 USD = {USD_TO_GDS_RATE} GDS</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 text-center">
            <a
              href="https://wa.me/50932836938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105"
            >
              Commander sur WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && (
        <div className="text-center text-gray-500 py-6">
          <Calculator className="mx-auto text-gray-300 mb-3" size={48} />
          <p>Entrez un montant pour voir le calcul</p>
        </div>
      )}
    </div>
  );
}
