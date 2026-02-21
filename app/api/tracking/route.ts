import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { trackingNumber } = await req.json();

  if (!trackingNumber || typeof trackingNumber !== "string") {
    return NextResponse.json({ order: null });
  }

  // Search wholesale_orders by tracking number
  const { data: orderData } = await supabaseAdmin
    .from("wholesale_orders")
    .select("*")
    .or(`miami_tracking_number.ilike.%${trackingNumber}%,haiti_tracking_number.ilike.%${trackingNumber}%`)
    .limit(1)
    .single();

  if (orderData) {
    return NextResponse.json({ order: orderData });
  }

  // Fallback: search legacy orders table
  const { data: altOrderData } = await supabaseAdmin
    .from("orders")
    .select("*")
    .or(`miami_tracking_number.ilike.%${trackingNumber}%,haiti_tracking_number.ilike.%${trackingNumber}%`)
    .limit(1)
    .single();

  return NextResponse.json({ order: altOrderData || null });
}
