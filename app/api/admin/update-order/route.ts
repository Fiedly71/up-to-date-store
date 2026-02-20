import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, orderId, table, updates } = await req.json();

  if (!userId || !orderId || !table || !updates) {
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

  const tableName = table === "wholesale_orders" ? "wholesale_orders" : "orders";
  const { error } = await supabaseAdmin
    .from(tableName)
    .update(updates)
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
