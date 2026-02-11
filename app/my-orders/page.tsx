import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const checkAuthAndLoadOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserEmail(null);
        setOrders([]);
        return;
      }
      setUserEmail(user.email ?? null);
      if (user.email) loadOrders(user.email);
    };
    checkAuthAndLoadOrders();
  }, []);

  const loadOrders = async (email: string) => {
    if (!email) return setOrders([]);
    const { data: orders } = await supabase
      .from("wholesale_orders")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });
    setOrders(orders || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">My Wholesale Orders</h1>
        {!userEmail && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6 text-center">
            Please <a href="/auth" className="underline font-bold">log in</a> to view your orders.
          </div>
        )}
        {userEmail && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="mb-6 text-gray-600">You have no orders yet.</p>
            <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition">Start Your First Import</a>
          </div>
        )}
        {userEmail && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Product Name</th>
                  <th className="px-4 py-2 text-left">Total Price</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  let statusColor = "bg-gray-200 text-gray-800";
                  let statusMsg = "";
                  if (order.order_status === "awaiting_payment") {
                    statusColor = "bg-yellow-200 text-yellow-800";
                    statusMsg = "Please pay at the store";
                  } else if (order.order_status === "processing") {
                    statusColor = "bg-blue-200 text-blue-800";
                    statusMsg = "Order placed on AliExpress";
                  } else if (order.order_status === "shipped_to_miami") {
                    statusColor = "bg-purple-200 text-purple-800";
                    statusMsg = "In transit to our Miami Hub";
                  } else if (order.order_status === "arrived_haiti") {
                    statusColor = "bg-green-200 text-green-800";
                    statusMsg = "Ready for pickup in Cap-Haïtien!";
                  }
                  let trackingInfo = "";
                  if (order.miami_tracking_number) {
                    trackingInfo += `Miami: ${order.miami_tracking_number}`;
                  }
                  if (order.haiti_tracking_number) {
                    trackingInfo += ` Haiti: ${order.haiti_tracking_number}`;
                  }
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-2 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{order.product_name}</td>
                      <td className="px-4 py-2 text-sm">${order.total_price_with_fees}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded ${statusColor} font-semibold`}>{order.order_status.replace("_", " ")}</span>
                        <div className="text-xs mt-1">{statusMsg}</div>
                      </td>
                      <td className="px-4 py-2 text-sm">{trackingInfo || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
