import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function mapPantryItemRow(row) {
  return {
    id: row.id,
    documentId: String(row.id),
    name: row.name,
    quantity: row.quantity,
    imageUrl: row.image_url,
    owner: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export async function PUT(request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid pantry item id" }, { status: 400 });
  }

  const payload = await request.json();
  const body = payload?.data || {};

  const { data, error } = await supabaseAdmin
    .from("pantry_items")
    .update({
      name: body.name,
      quantity: body.quantity,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: mapPantryItemRow(data) });
}

export async function DELETE(_request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid pantry item id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("pantry_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: null });
}
