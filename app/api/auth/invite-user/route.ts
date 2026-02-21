import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateToken } from "@/app/utils/tokenUtils";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, email, firstName, lastName, phone, city, address, makeAdmin } = await req.json();

  if (!userId || !email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
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

  // Create user with a random temporary password (user will set their own via invite link)
  const crypto = await import("crypto");
  const tempPassword = crypto.randomBytes(32).toString("hex");

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName || "",
      last_name: lastName || "",
      phone: phone || "",
      city: city || "",
      address: address || "",
    },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Insert into profiles table
  if (newUser?.user) {
    await supabaseAdmin.from("profiles").upsert({
      id: newUser.user.id,
      email,
      is_admin: makeAdmin === true,
    });
  }

  // Generate non-expiring invitation token
  const token = generateToken({
    userId: newUser.user.id,
    email: newUser.user.email!,
    type: "invite",
    nonce: newUser.user.updated_at || newUser.user.created_at,
  });

  const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/+$/, "") || "";
  const inviteLink = `${origin}/auth?token=${encodeURIComponent(token)}&type=invite`;

  return NextResponse.json({
    success: true,
    inviteLink,
    user: {
      id: newUser.user.id,
      email,
      first_name: firstName || "",
      last_name: lastName || "",
      phone: phone || "",
      city: city || "",
      address: address || "",
      is_admin: makeAdmin === true,
      created_at: newUser.user.created_at,
    },
  });
}
