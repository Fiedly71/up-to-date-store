import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Verify admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not admin" }, { status: 403 });
  }

  // Fetch orders + all auth users in parallel
  const [ordersResult, wholesaleResult, usersResult] = await Promise.all([
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("wholesale_orders").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Also fetch profiles to get is_admin status
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, is_admin");
  const adminMap: Record<string, boolean> = {};
  (profiles || []).forEach((p: any) => { adminMap[p.id] = p.is_admin; });

  // Map auth users to a clean format with metadata
  const users = (usersResult.data?.users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    first_name: u.user_metadata?.first_name || "",
    last_name: u.user_metadata?.last_name || "",
    phone: u.user_metadata?.phone || "",
    city: u.user_metadata?.city || "",
    address: u.user_metadata?.address || "",
    is_admin: adminMap[u.id] || false,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));

  return NextResponse.json({
    orders: ordersResult.data || [],
    wholesaleOrders: wholesaleResult.data || [],
    users,
  });
}
