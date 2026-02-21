import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_FIELDS = ["first_name", "last_name", "phone", "city", "address"];

export async function POST(req: NextRequest) {
  const { userId, updates } = await req.json();

  if (!userId || !updates || typeof updates !== "object") {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  // Verify user exists
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 403 });
  }

  // Filter to only allowed fields
  const safeUpdates: Record<string, string> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in updates && typeof updates[key] === "string") {
      safeUpdates[key] = updates[key].trim();
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
  }

  // Update user_metadata in Supabase Auth
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { ...userData.user.user_metadata, ...safeUpdates },
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: safeUpdates });
}
