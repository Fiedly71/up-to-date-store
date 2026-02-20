import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { trackingNumber } = await req.json();

  if (!trackingNumber || typeof trackingNumber !== "string" || trackingNumber.length > 100) {
    return NextResponse.json({ found: false, events: [] }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";

  // Try Trackingmore API (auto-detect carrier)
  try {
    const response = await fetch(
      "https://trackingmore-api-v2.p.rapidapi.com/trackings/realtime",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "trackingmore-api-v2.p.rapidapi.com",
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          carrier_code: "auto",
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data?.data?.items && data.data.items.length > 0) {
        const item = data.data.items[0];
        const trackInfo =
          item.origin_info?.trackinfo ||
          item.destination_info?.trackinfo ||
          [];

        return NextResponse.json({
          found: true,
          carrier: item.carrier_code || "unknown",
          status: item.status || "unknown",
          lastEvent: item.latest_event || "",
          lastCheckpoint: item.latest_checkpoint_time || "",
          events: trackInfo.map((e: any) => ({
            date: e.Date || e.checkpoint_date || "",
            status: e.StatusDescription || e.checkpoint_delivery_status || "",
            details: e.Details || e.tracking_detail || "",
            location: e.checkpoint_delivery_substatus || "",
          })),
        });
      }
    }
  } catch {
    // Trackingmore failed, try fallback
  }

  // Fallback: Try Package Tracker API
  try {
    const response = await fetch(
      `https://package-tracker1.p.rapidapi.com/track/${encodeURIComponent(trackingNumber)}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "package-tracker1.p.rapidapi.com",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data?.shipments && data.shipments.length > 0) {
        const shipment = data.shipments[0];
        return NextResponse.json({
          found: true,
          carrier: shipment.carrier || "unknown",
          status: shipment.status || "unknown",
          lastEvent: shipment.lastEvent?.description || "",
          lastCheckpoint: shipment.lastEvent?.date || "",
          events: (shipment.events || []).map((e: any) => ({
            date: e.date || "",
            status: e.status || "",
            details: e.description || "",
            location: e.location || "",
          })),
        });
      }
    }
  } catch {
    // Fallback also failed
  }

  return NextResponse.json({ found: false, events: [] });
}
