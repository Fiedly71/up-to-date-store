import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "@/app/utils/tokenUtils";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  // Look up user by email
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  const user = users.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    // Don't reveal whether user exists — return success anyway
    return NextResponse.json({ success: true });
  }

  // Generate a signed, non-expiring token using user's updated_at as nonce
  // Token auto-invalidates only after a password change (not by time)
  const token = generateToken({
    userId: user.id,
    email: user.email!,
    type: "recovery",
    nonce: user.updated_at || user.created_at,
  });

  const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/+$/, "") || "";

  // Include our custom token in Supabase's redirectTo URL
  // This way, even if Supabase's own link expires, our token is in the redirect URL
  const redirectTo = `${origin}/auth?token=${encodeURIComponent(token)}&type=recovery`;

  // Send Supabase's standard reset email with our custom redirectTo
  await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

  return NextResponse.json({ success: true });
}
