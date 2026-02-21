import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const {
    userId, // admin's userId for auth check
    clientEmail,
    productName,
    productUrl,
    productImage,
    basePrice,
    serviceFee,
    totalWithFees,
    quantity,
    platform,
    notes,
    orderStatus,
  } = await req.json();

  if (!userId || !clientEmail || !productName) {
    return NextResponse.json({ error: "Données manquantes (email client, nom du produit)" }, { status: 400 });
  }

  // Verify admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const extraData = JSON.stringify({
    user_id: null,
    product_url: productUrl || null,
    product_image: productImage || null,
    base_price: basePrice || 0,
    service_fee: serviceFee || 0,
    notes: notes || null,
    platform: platform || "other",
  });

  const { data: order, error: insertError } = await supabaseAdmin
    .from("wholesale_orders")
    .insert({
      user_email: clientEmail,
      product_name: productName,
      ali_item_id: extraData,
      unit_price_usd: basePrice || 0,
      quantity: quantity || 1,
      total_price_with_fees: totalWithFees || 0,
      order_status: orderStatus || "awaiting_payment",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order });
}
