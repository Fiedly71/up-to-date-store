import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyToken } from "@/app/utils/tokenUtils";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Token et mot de passe requis." }, { status: 400 });
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
  }

  // Verify the HMAC-signed token
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Lien invalide ou corrompu." }, { status: 400 });
  }

  // Get the current user to check the nonce (updated_at)
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(payload.userId);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  // Check that nonce matches — if user already changed password, token is invalidated
  const currentNonce = userData.user.updated_at || userData.user.created_at;
  if (currentNonce !== payload.nonce) {
    return NextResponse.json({
      error: "Ce lien a déjà été utilisé. Le mot de passe a déjà été modifié depuis la création de ce lien.",
    }, { status: 400 });
  }

  // Update password via admin API
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    payload.userId,
    { password: newPassword }
  );

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
