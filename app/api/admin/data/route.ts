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

  // Fetch all data in parallel
  const [ordersResult, wholesaleResult, profilesResult] = await Promise.all([
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("wholesale_orders").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    orders: ordersResult.data || [],
    wholesaleOrders: wholesaleResult.data || [],
    users: profilesResult.data || [],
  });
}
