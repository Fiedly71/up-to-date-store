import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// MonCash Alert URL — receives payment notification (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transactionId = body.transactionId || body.transaction_id || body.TransactionId;

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    // Verify the transaction with MonCash API
    const clientId = process.env.MONCASH_CLIENT_ID;
    const clientSecret = process.env.MONCASH_CLIENT_SECRET;
    const moncashApiBase = process.env.MONCASH_API_BASE || "https://sandbox.moncashbutton.digicelgroup.com/Api";

    if (!clientId || !clientSecret) {
      console.error("MonCash credentials not configured");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // Get access token
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch(`${moncashApiBase}/oauth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "scope=read,write&grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      console.error("MonCash token error:", await tokenRes.text());
      return NextResponse.json({ error: "Auth failed" }, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Retrieve transaction details
    const txRes = await fetch(`${moncashApiBase}/v1/RetrieveTransactionPayment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionId }),
    });

    if (!txRes.ok) {
      console.error("MonCash transaction retrieval error:", await txRes.text());
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const txData = await txRes.json();
    const payment = txData.payment;

    if (!payment) {
      return NextResponse.json({ error: "No payment data" }, { status: 400 });
    }

    // Log the payment in our database
    const { error: logError } = await supabaseAdmin.from("moncash_payments").insert({
      transaction_id: String(transactionId),
      order_id: payment.payer?.orderId || payment.reference || null,
      amount: payment.cost || payment.amount || 0,
      status: payment.message || "completed",
      payer_phone: payment.payer?.msisdn || null,
      raw_data: JSON.stringify(txData),
    });

    if (logError) {
      console.error("Error logging MonCash payment:", logError.message);
    }

    // Update order status if we have an order reference
    const orderId = payment.payer?.orderId || payment.reference;
    if (orderId) {
      // Try wholesale_orders first, then orders
      const { error: updateError } = await supabaseAdmin
        .from("wholesale_orders")
        .update({ order_status: "payment_confirmed" })
        .eq("id", orderId);

      if (updateError) {
        await supabaseAdmin
          .from("orders")
          .update({ order_status: "payment_confirmed" })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({ success: true, transactionId });
  } catch (err: any) {
    console.error("MonCash notify error:", err.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
