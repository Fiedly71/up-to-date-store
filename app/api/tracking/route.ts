import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { trackingNumber } = await req.json();

  if (!trackingNumber || typeof trackingNumber !== "string" || trackingNumber.length > 100) {
    return NextResponse.json({ found: false, events: [], error: "invalid" }, { status: 400 });
  }

  const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "";
  const trackingMoreKey = process.env.TRACKINGMORE_API_KEY || "";

  // === TRY 1: TrackingMore Direct API (50 free credits/month) ===
  if (trackingMoreKey) {
    try {
      // First, create a tracking (required by TrackingMore)
      const createRes = await fetch("https://api.trackingmore.com/v4/trackings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Tracking-Api-Key": trackingMoreKey,
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          courier_code: "auto",
        }),
      });

      // Then get the real-time tracking
      const realtimeRes = await fetch("https://api.trackingmore.com/v4/trackings/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Tracking-Api-Key": trackingMoreKey,
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          courier_code: "auto",
        }),
      });

      if (realtimeRes.ok) {
        const result = await realtimeRes.json();
        const data = result?.data;

        if (data) {
          const originEvents = data.origin_info?.trackinfo || [];
          const destEvents = data.destination_info?.trackinfo || [];
          const allEvents = [...destEvents, ...originEvents];

          if (allEvents.length > 0 || data.delivery_status) {
            return NextResponse.json({
              found: true,
              carrier: data.courier_code || "auto",
              status: data.delivery_status || "in_transit",
              lastEvent: allEvents[0]?.tracking_detail || allEvents[0]?.Details || "",
              lastCheckpoint: allEvents[0]?.checkpoint_date || allEvents[0]?.Date || "",
              events: allEvents.map((e: any) => ({
                date: e.checkpoint_date || e.Date || "",
                status: e.checkpoint_delivery_status || e.StatusDescription || "",
                details: e.tracking_detail || e.Details || "",
                location: e.location || "",
              })),
            });
          }
        }
      }
    } catch {
      // TrackingMore failed, try next
    }
  }

  // === TRY 2: TrackingPackage on RapidAPI (fallback) ===
  if (rapidApiKey) {
    try {
      const url = new URL("https://trackingpackage.p.rapidapi.com/TrackingPackage");
      url.searchParams.set("trackingNumber", trackingNumber);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic Ym9sZGNoYXQ6TGZYfm0zY2d1QzkuKz9SLw==",
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "trackingpackage.p.rapidapi.com",
        },
      });

      if (response.status === 429) {
        return NextResponse.json({
          found: false,
          events: [],
          error: "rate_limit",
          message: "Limite quotidienne atteinte. Réessayez demain.",
        });
      }

      if (response.ok) {
        const data = await response.json();

        const events =
          data?.trackingEvents || data?.events || data?.data?.events ||
          data?.result?.events || data?.shipment?.events || data?.tracking?.events || [];

        const carrier =
          data?.carrier || data?.courierName || data?.data?.carrier ||
          data?.result?.carrier || data?.shipment?.carrier || "";

        const status =
          data?.status || data?.deliveryStatus || data?.data?.status ||
          data?.result?.status || data?.shipment?.status || "";

        const lastEvent =
          data?.lastEvent || data?.latestEvent || data?.data?.lastEvent ||
          (events.length > 0 ? events[0]?.description || events[0]?.message || events[0]?.status || "" : "");

        const lastCheckpoint =
          data?.lastCheckpointTime || data?.data?.lastCheckpointTime ||
          (events.length > 0 ? events[0]?.date || events[0]?.datetime || "" : "");

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
              details: e.description || e.message || e.details || e.statusDescription || "",
              location: e.location || e.city || e.place || "",
            })),
          });
        }

        if (data && typeof data === "object" && (data.status || data.carrier || data.origin)) {
          return NextResponse.json({
            found: true,
            carrier: data.carrier || "auto",
            status: data.status || "unknown",
            lastEvent: data.lastEvent || data.statusDescription || "",
            lastCheckpoint: data.lastUpdate || "",
            events: [],
          });
        }
      }
    } catch {
      // TrackingPackage failed
    }
  }

  return NextResponse.json({ found: false, events: [] });
}
