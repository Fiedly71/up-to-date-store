import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/";
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!profile || !profile.is_admin) {
        window.location.href = "/";
        return;
      }
      loadOrders();
    };
    checkAdmin();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data: orders } = await supabase
      .from("wholesale_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(orders || []);
    setLoading(false);
    if (orders) {
      const total = orders.length;
      const pending = orders.filter((o: any) => o.order_status === "awaiting_payment").length;
      const revenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_price_with_fees) || 0), 0);
      setStats({ total, pending, revenue });
    }
  };

  const saveOrder = async (orderId: string, status: string, tracking: string) => {
    await supabase
      .from("wholesale_orders")
      .update({ order_status: status, miami_tracking_number: tracking })
      .eq("id", orderId);
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - Manage Imports</h1>
        <div className="flex flex-wrap gap-6 justify-center mb-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-blue-500 min-w-[180px]">
            <span className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</span>
            <span className="text-gray-700">Total Orders</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-yellow-500 min-w-[180px]">
            <span className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</span>
            <span className="text-gray-700">Pending Payments</span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-green-500 min-w-[180px]">
            <span className="text-2xl font-bold text-green-600 mb-1">${stats.revenue.toFixed(2)}</span>
            <span className="text-gray-700">Total Revenue</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Customer Email</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Total Price</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tracking Number</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-4 py-2 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm">{order.user_email || '-'}</td>
                  <td className="px-4 py-2 text-sm">{order.product_name}</td>
                  <td className="px-4 py-2 text-sm">${order.total_price_with_fees}</td>
                  <td className="px-4 py-2 text-sm">
                    <select
                      value={order.order_status}
                      onChange={e => saveOrder(order.id, e.target.value, order.miami_tracking_number || "")}
                      className="border rounded px-2 py-1"
                    >
                      <option value="awaiting_payment">awaiting payment</option>
                      <option value="processing">processing</option>
                      <option value="shipped_to_miami">shipped to miami</option>
                      <option value="arrived_haiti">arrived haiti</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="text"
                      value={order.miami_tracking_number || ""}
                      onChange={e => saveOrder(order.id, order.order_status, e.target.value)}
                      className="border rounded px-2 py-1 w-32"
                      placeholder="Tracking #"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => saveOrder(order.id, order.order_status, order.miami_tracking_number || "")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-bold"
                    >Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="text-center py-6 text-gray-500">Loading...</div>}
      </div>
    </div>
  );
}
