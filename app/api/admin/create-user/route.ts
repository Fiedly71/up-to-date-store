import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, email, password, firstName, lastName, phone, city, address, makeAdmin } = await req.json();

  if (!userId || !email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
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

  // Create user via Supabase Auth Admin (bypasses email confirmation)
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
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

  return NextResponse.json({
    success: true,
    user: {
      id: newUser?.user?.id,
      email,
      first_name: firstName || "",
      last_name: lastName || "",
      phone: phone || "",
      city: city || "",
      address: address || "",
      is_admin: makeAdmin === true,
      created_at: newUser?.user?.created_at,
    },
  });
}
