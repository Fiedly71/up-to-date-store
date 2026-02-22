import { NextRequest, NextResponse } from "next/server";

// In-memory cache: key = "query:page", value = { data, timestamp }
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) cache.delete(key);
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const page = req.nextUrl.searchParams.get("page") || "1";

  if (!q) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 });
  }

  const cacheKey = `${q.toLowerCase()}:${page}`;

  // Check cache
  cleanExpired();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  // Call RapidAPI
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://aliexpress-datahub.p.rapidapi.com/item_search_2?q=${encodeURIComponent(q)}&page=${page}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "aliexpress-datahub.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    // Cache the response
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (err) {
    console.error("AliExpress search API error:", err);
    return NextResponse.json({ error: "API request failed" }, { status: 502 });
  }
}
