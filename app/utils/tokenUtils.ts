import crypto from "crypto";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TokenPayload {
  userId: string;
  email: string;
  type: "recovery" | "invite";
  nonce: string; // user's updated_at — invalidates token after password change
}

export function generateToken(payload: TokenPayload): string {
  const data = JSON.stringify(payload);
  const base64 = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(base64)
    .digest("base64url");
  return `${base64}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [base64, signature] = parts;

  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(base64)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(base64, "base64url").toString());
    if (!data.userId || !data.email || !data.type) return null;
    return data as TokenPayload;
  } catch {
    return null;
  }
}
