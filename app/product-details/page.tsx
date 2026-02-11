import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [priceObj, setPriceObj] = useState<{ total: string; fee: number; feeLabel: string } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
      setError("No product ID provided.");
      setLoading(false);
      return;
    }
    fetchProductDetails(productId);
  }, []);

  const fetchProductDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://ali-express1.p.rapidapi.com/product/details?product_id=${id}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "d345cf7a9dmsh588ba309bb4807fp11a983jsnc43ad765201f",
          "X-RapidAPI-Host": "ali-express1.p.rapidapi.com"
        }
      });
      const data = await res.json();
      setProduct(data);
      setPriceObj(calculateFinalPrice(data.app_sale_price));
    } catch {
      setError("Product not found.");
    } finally {
      setLoading(false);
    }
  };

  function calculateFinalPrice(base: string) {
    const price = parseFloat(base);
    let fee = 0;
    let feeLabel = "";
    if (price < 50) {
      fee = 8;
      feeLabel = "$8 fee";
    } else if (price < 100) {
      fee = 12;
      feeLabel = "$12 fee";
    } else if (price < 200) {
      fee = 20;
      feeLabel = "$20 fee";
    } else {
      fee = price * 0.2;
      feeLabel = "20% fee";
    }
    return { total: (price + fee).toFixed(2), fee, feeLabel };
  }

  const handleOrder = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = `/auth?message=Please create an account to place your order&redirect=${window.location.pathname + window.location.search}`;
      return;
    }
    await supabase.from("wholesale_orders").insert([
      {
        product_name: product.product_title,
        ali_item_id: product.product_id,
        total_price_with_fees: priceObj?.total,
        order_status: "awaiting_payment",
        created_at: new Date().toISOString(),
        user_id: session.user.id
      }
    ]);
    alert("Order saved! Please visit our store in Champin or use MonCash to complete your payment.");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  const images = product.product_images || [product.product_main_image_url];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">{product.product_title}</h1>
        <div className="flex gap-4 mb-4 overflow-x-auto">
          {images.map((img: string, idx: number) => (
            <img key={idx} src={img} className="w-32 h-32 object-contain rounded border" alt="Product" />
          ))}
        </div>
        <p className="text-xl text-pink-600 font-bold mb-2">${priceObj?.total} USD <span className="text-xs text-gray-500">({priceObj?.feeLabel} applied)</span></p>
        <div className="mb-4 text-gray-700">{product.product_description || ""}</div>
        <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded mb-4">
          <b>Logistics Info:</b> This item will be shipped from China to our Miami Hub (<b>8018 NW 66th ST, APT: BP-081444, FLORIDA, MIAMI</b>) before being forwarded to Cap-Haïtien.
        </div>
        <button onClick={handleOrder} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition">Confirm Order</button>
      </div>
    </div>
  );
}
