import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { trackingNumber } = await req.json();

  if (!trackingNumber || typeof trackingNumber !== "string" || trackingNumber.length > 100) {
    return NextResponse.json({ found: false, events: [], error: "invalid" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";

  if (!apiKey) {
    return NextResponse.json({ found: false, events: [], error: "no_api_key" });
  }

  // TrackingPackage API
  try {
    const url = new URL("https://trackingpackage.p.rapidapi.com/TrackingPackage");
    url.searchParams.set("trackingNumber", trackingNumber);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic Ym9sZGNoYXQ6TGZYfm0zY2d1QzkuKz9SLw==",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "trackingpackage.p.rapidapi.com",
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      return NextResponse.json({
        found: false,
        events: [],
        error: "rate_limit",
        message: "Quota journalier dépassé. Réessayez demain ou upgrader le plan RapidAPI."
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`TrackingPackage API error: ${response.status}`, errorText);
      return NextResponse.json({
        found: false,
        events: [],
        error: "api_error",
        message: `Erreur API (${response.status})`
      });
    }

    const data = await response.json();
    console.log("TrackingPackage API response:", JSON.stringify(data).substring(0, 500));

    // Try to extract tracking events from various possible response structures
    const events =
      data?.trackingEvents ||
      data?.events ||
      data?.data?.events ||
      data?.data?.trackingEvents ||
      data?.result?.events ||
      data?.shipment?.events ||
      data?.tracking?.events ||
      [];

    const carrier =
      data?.carrier ||
      data?.courierName ||
      data?.data?.carrier ||
      data?.result?.carrier ||
      data?.shipment?.carrier ||
      data?.tracking?.carrier ||
      "";

    const status =
      data?.status ||
      data?.deliveryStatus ||
      data?.data?.status ||
      data?.result?.status ||
      data?.shipment?.status ||
      "";

    const lastEvent =
      data?.lastEvent ||
      data?.latestEvent ||
      data?.data?.lastEvent ||
      (events.length > 0
        ? events[0]?.description || events[0]?.message || events[0]?.details || events[0]?.status || ""
        : "");

    const lastCheckpoint =
      data?.lastCheckpointTime ||
      data?.data?.lastCheckpointTime ||
      (events.length > 0 ? events[0]?.date || events[0]?.datetime || events[0]?.time || "" : "");

    if (events.length > 0 || status || carrier) {
      return NextResponse.json({
        found: true,
        carrier: carrier || "auto",
        status: status || "in_transit",
        lastEvent,
        lastCheckpoint,
        events: events.map((e: any) => ({
          date: e.date || e.datetime || e.time || e.timestamp || "",
          status: e.status || e.statusDescription || "",
          details: e.description || e.message || e.details || e.detail || e.statusDescription || "",
          location: e.location || e.city || e.place || "",
        })),
      });
    }

    // If the response has any useful data, try to return it
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
      // Check if it looks like tracking data
      if (data.status || data.carrier || data.origin || data.destination) {
        return NextResponse.json({
          found: true,
          carrier: data.carrier || data.courierName || "auto",
          status: data.status || data.deliveryStatus || "unknown",
          lastEvent: data.lastEvent || data.statusDescription || "",
          lastCheckpoint: data.lastUpdate || data.lastCheckpointTime || "",
          events: [],
        });
      }
    }

    return NextResponse.json({ found: false, events: [] });
  } catch (err) {
    console.error("TrackingPackage API exception:", err);
    return NextResponse.json({ found: false, events: [], error: "exception" });
  }
}
