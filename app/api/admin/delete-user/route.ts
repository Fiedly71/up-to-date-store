import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, targetUserId } = await req.json();

  if (!userId || !targetUserId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Cannot delete yourself
  if (userId === targetUserId) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  // Verify caller is admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not admin" }, { status: 403 });
  }

  // Delete from profiles table first
  await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);

  // Delete from Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
