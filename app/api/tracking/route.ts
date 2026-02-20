import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { trackingNumber } = await req.json();

  if (!trackingNumber || typeof trackingNumber !== "string" || trackingNumber.length > 100) {
    return NextResponse.json({ found: false, events: [] }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";

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

    if (response.ok) {
      const data = await response.json();

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

      // If the response is a flat object or has a different structure, try to use it
      if (data && typeof data === "object" && (data.status || data.carrier || data.origin)) {
        return NextResponse.json({
          found: true,
          carrier: data.carrier || data.courierName || "auto",
          status: data.status || data.deliveryStatus || "unknown",
          lastEvent: data.lastEvent || data.statusDescription || JSON.stringify(data).substring(0, 200),
          lastCheckpoint: data.lastUpdate || data.lastCheckpointTime || "",
          events: [],
        });
      }
    }
  } catch {
    // TrackingPackage failed
  }

  return NextResponse.json({ found: false, events: [] });
}
