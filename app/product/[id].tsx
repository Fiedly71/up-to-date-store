"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { calculateFinalPrice, getPriceBreakdown } from "@/app/utils/pricing";

// Helper: fetch product details from AliExpress API
async function fetchAliExpressProduct(productId: string) {
  const res = await fetch(`https://ali-express1.p.rapidapi.com/product/details?product_id=${productId}`, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "d345cf7a9dmsh588ba309bb4807fp11a983jsnc43ad765201f",
      "X-RapidAPI-Host": "ali-express1.p.rapidapi.com"
    }
  });
  return res.json();
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAliExpressProduct(id)
      .then(data => setProduct(data))
      .catch(() => setError("Failed to load product details."))
      .finally(() => setLoading(false));
  }, [id]);

  // --- Order State ---
  const [orderStatus, setOrderStatus] = useState("");
  const [ordering, setOrdering] = useState(false);

  // --- Buy Now Handler ---
  const handleBuyNow = async () => {
    if (!product) return;
    setOrdering(true);
    setOrderStatus("");
    const totalPrice = calculateFinalPrice(Number(product.app_sale_price));
    const { data, error } = await supabase.from('orders').insert([
      {
        product_id: id,
        product_title: product.product_title,
        price: totalPrice,
        image_url: product.product_main_image_url,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
    ]);
    if (error) {
      setOrderStatus("Order failed. Please try again.");
    } else {
      setOrderStatus("Order placed! We will contact you soon.");
    }
    setOrdering(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">{product.product_title}</h1>
      <div className="flex flex-col md:flex-row gap-8 mb-6">
        <div className="flex-1 flex items-center justify-center">
          <img src={product.product_main_image_url} alt={product.product_title} className="w-64 h-64 object-contain rounded-xl shadow-lg" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-2">
            {(() => {
              const breakdown = getPriceBreakdown(Number(product.app_sale_price));
              return <>
                <p className="text-xl text-pink-600 font-bold">${breakdown.total.toFixed(2)} USD</p>
                <span className="relative group cursor-pointer">
                  <span className="ml-1 text-gray-400">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#FF4747" strokeWidth="2" fill="#fff"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#FF4747">i</text></svg>
                  </span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white text-gray-700 text-xs rounded shadow-lg px-3 py-2 z-10 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    Base: ${breakdown.base.toFixed(2)}<br/>
                    Fee: {breakdown.feeType} ({breakdown.fee.toFixed(2)})<br/>
                    <b>Total: ${breakdown.total.toFixed(2)}</b>
                  </span>
                </span>
              </>;
            })()}
          </div>
          <div className="mb-4 text-gray-700">{product.product_description}</div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition disabled:opacity-60" onClick={handleBuyNow} disabled={ordering}>
            {ordering ? "Ordering..." : "Buy Now"}
          </button>
          {orderStatus && <div className="mt-4 text-green-600 font-semibold">{orderStatus}</div>}
        </div>
      </div>
      {product.product_images && product.product_images.length > 1 && (
        <div className="flex gap-2 flex-wrap mt-4">
          {product.product_images.map((img: string, idx: number) => (
            <img key={idx} src={img} alt="Product" className="w-24 h-24 object-contain rounded border" />
          ))}
        </div>
      )}
    </div>
  );
}
