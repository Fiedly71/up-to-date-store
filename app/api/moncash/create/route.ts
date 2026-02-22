import { NextRequest, NextResponse } from "next/server";

// POST /api/moncash/create — Creates a MonCash payment and returns the redirect URL
export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    const clientId = process.env.MONCASH_CLIENT_ID;
    const clientSecret = process.env.MONCASH_CLIENT_SECRET;
    const moncashApiBase = process.env.MONCASH_API_BASE || "https://sandbox.moncashbutton.digicelgroup.com/Api";

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "MonCash non configuré" }, { status: 500 });
    }

    // 1. Get access token
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
      const errText = await tokenRes.text();
      console.error("MonCash token error:", errText);
      return NextResponse.json({ error: "Erreur d'authentification MonCash" }, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Create payment
    const paymentOrderId = orderId || `ORDER-${Date.now()}`;
    const createRes = await fetch(`${moncashApiBase}/v1/CreatePayment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, orderId: paymentOrderId }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("MonCash create payment error:", errText);
      return NextResponse.json({ error: "Erreur création paiement" }, { status: 500 });
    }

    const paymentData = await createRes.json();
    const paymentToken = paymentData.payment_token?.token;

    if (!paymentToken) {
      return NextResponse.json({ error: "Token de paiement non reçu" }, { status: 500 });
    }

    // 3. Build redirect URL
    const gatewayBase = moncashApiBase.includes("sandbox")
      ? "https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware"
      : "https://moncashbutton.digicelgroup.com/Moncash-middleware";

    const redirectUrl = `${gatewayBase}/Payment/Redirect?token=${paymentToken}`;

    return NextResponse.json({
      success: true,
      redirectUrl,
      token: paymentToken,
      orderId: paymentOrderId,
    });
  } catch (err: any) {
    console.error("MonCash create error:", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
