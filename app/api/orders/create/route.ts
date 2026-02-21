import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const {
    userId,
    userEmail,
    productName,
    productUrl,
    productImage,
    basePrice,
    serviceFee,
    totalWithFees,
    notes,
    quantity,
  } = await req.json();

  if (!userId || !userEmail || !productName) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  // Verify user exists in auth
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 403 });
  }

  // Store extra data in ali_item_id as JSON
  const extraData = JSON.stringify({
    user_id: userId,
    product_url: productUrl || null,
    product_image: productImage || null,
    base_price: basePrice || 0,
    service_fee: serviceFee || 0,
    notes: notes || null,
  });

  // Insert using actual wholesale_orders columns
  const { data: order, error: insertError } = await supabaseAdmin
    .from("wholesale_orders")
    .insert({
      user_email: userEmail,
      product_name: productName,
      ali_item_id: extraData,
      unit_price_usd: basePrice || 0,
      quantity: quantity || 1,
      total_price_with_fees: totalWithFees || 0,
      order_status: "awaiting_payment",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order });
}
