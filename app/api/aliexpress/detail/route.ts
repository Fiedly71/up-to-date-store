import { NextRequest, NextResponse } from "next/server";

// In-memory cache: key = itemId, value = { data, timestamp }
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (details change less often)

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) cache.delete(key);
  }
}

export async function GET(req: NextRequest) {
  const itemId = req.nextUrl.searchParams.get("itemId")?.trim();

  if (!itemId || !/^\d+$/.test(itemId)) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  // Check cache
  cleanExpired();
  const cached = cache.get(itemId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://aliexpress-datahub.p.rapidapi.com/item_detail_2?itemId=${itemId}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "aliexpress-datahub.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    // Cache the response
    cache.set(itemId, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (err) {
    console.error("AliExpress detail API error:", err);
    return NextResponse.json({ error: "API request failed" }, { status: 502 });
  }
}
