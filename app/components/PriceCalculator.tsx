"use client";
import { useState, useEffect } from "react";

export default function PriceCalculator() {
  const [input, setInput] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [fee, setFee] = useState(0);
  const [feeType, setFeeType] = useState("");
  const [total, setTotal] = useState(0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseFloat(e.target.value.replace(/,/g, "."));
    setInput(isNaN(value) ? 0 : value);
  }

  useEffect(() => {
    if (input > 0) {
      const breakdown = require("@/app/utils/pricing").getPriceBreakdown(input);
      setFee(breakdown.fee);
      setFeeType(breakdown.feeType);
      setTotal(breakdown.total);
      setResult(breakdown);
    } else {
      setResult(null);
    }
  }, [input]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-center">
        <input
          type="number"
          min="0"
          step="0.01"
          value={input || ""}
          onChange={handleChange}
          placeholder="Prix du produit ($)"
          className="w-full sm:w-64 px-6 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-lg font-semibold text-blue-900 bg-white shadow"
        />
        <span className="text-2xl font-bold text-blue-700">$</span>
      </div>
      {result && (
        <div className="w-full mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center border border-blue-100 shadow">
          <div className="text-lg text-gray-700 mb-2">Frais appliqués : <span className="font-bold text-blue-700">{feeType}</span></div>
          <div className="text-2xl font-extrabold text-blue-900 mb-1">Total à payer : {total.toFixed(2)} $</div>
          <div className="text-sm text-gray-500">(Produit + frais d’assistance inclus)</div>
        </div>
      )}
    </div>
  );
}
