import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all products (public)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ products: data });
}

// POST: Create or update a product (admin only)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, action, product } = body;

  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Verify admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (action === "create") {
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: product.name,
        description: product.description || null,
        price: product.price || null,
        image_url: product.image_url || null,
        category: product.category || null,
        in_stock: product.in_stock !== false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data });
  }

  if (action === "update") {
    if (!product.id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        name: product.name,
        description: product.description || null,
        price: product.price || null,
        image_url: product.image_url || null,
        category: product.category || null,
        in_stock: product.in_stock !== false,
      })
      .eq("id", product.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data });
  }

  if (action === "delete") {
    if (!product.id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
}
