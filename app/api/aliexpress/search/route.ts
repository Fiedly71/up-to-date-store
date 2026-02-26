import { NextRequest, NextResponse } from "next/server";
import { getNextApiKey, getAllApiKeys } from "../keys";

// In-memory cache: key = "query:page", value = { data, timestamp }
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) cache.delete(key);
  }
}

async function fetchWithKey(apiKey: string, q: string, page: string) {
  const response = await fetch(
    `https://aliexpress-datahub.p.rapidapi.com/item_search_2?q=${encodeURIComponent(q)}&page=${page}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "aliexpress-datahub.p.rapidapi.com",
      },
    }
  );
  return { response, status: response.status };
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

  // Try each key — if one hits quota limit, try the next
  const allKeys = getAllApiKeys();
  if (allKeys.length === 0) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const firstKey = getNextApiKey()!;
    let { response, status } = await fetchWithKey(firstKey, q, page);

    // If quota exceeded (429), try other keys
    if (status === 429) {
      for (const key of allKeys) {
        if (key === firstKey) continue;
        const retry = await fetchWithKey(key, q, page);
        if (retry.status !== 429) { response = retry.response; status = retry.status; break; }
      }
    }

    const data = await response.json();
    if (status !== 429) {
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    return NextResponse.json(data, { status: status === 429 ? 429 : 200 });
  } catch (err) {
    console.error("AliExpress search API error:", err);
    return NextResponse.json({ error: "API request failed" }, { status: 502 });
  }
}
