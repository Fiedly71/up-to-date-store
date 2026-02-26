import { NextRequest, NextResponse } from "next/server";
import { getNextApiKey, getAllApiKeys } from "../keys";

// In-memory cache: key = itemId, value = { data, timestamp }
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour (details change less often)

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) cache.delete(key);
  }
}

async function fetchWithKey(apiKey: string, itemId: string) {
  const response = await fetch(
    `https://aliexpress-datahub.p.rapidapi.com/item_detail_2?itemId=${itemId}`,
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

  const allKeys = getAllApiKeys();
  if (allKeys.length === 0) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const firstKey = getNextApiKey()!;
    let { response, status } = await fetchWithKey(firstKey, itemId);

    // If quota exceeded (429), try other keys
    if (status === 429) {
      for (const key of allKeys) {
        if (key === firstKey) continue;
        const retry = await fetchWithKey(key, itemId);
        if (retry.status !== 429) { response = retry.response; status = retry.status; break; }
      }
    }

    const data = await response.json();
    if (status !== 429) {
      cache.set(itemId, { data, timestamp: Date.now() });
    }
    return NextResponse.json(data, { status: status === 429 ? 429 : 200 });
  } catch (err) {
    console.error("AliExpress detail API error:", err);
    return NextResponse.json({ error: "API request failed" }, { status: 502 });
  }
}
