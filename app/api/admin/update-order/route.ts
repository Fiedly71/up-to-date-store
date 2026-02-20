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

  // Whitelist allowed update fields
  const allowedFields = ["order_status", "miami_tracking_number", "haiti_tracking_number", "notes"];
  const sanitizedUpdates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      sanitizedUpdates[key] = updates[key];
    }
  }

  if (Object.keys(sanitizedUpdates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(tableName)
    .update(sanitizedUpdates)
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
