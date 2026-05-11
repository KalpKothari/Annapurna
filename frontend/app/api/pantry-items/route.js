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

function withMeta(data) {
  return {
    data,
    meta: {
      pagination: {
        page: 1,
        pageSize: Array.isArray(data) ? data.length : 1,
        pageCount: 1,
        total: Array.isArray(data) ? data.length : 1,
      },
    },
  };
}

export async function GET(request) {
  const supabaseAdmin = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const ownerId = Number(searchParams.get("filters[owner][id][$eq]"));
  const sort = searchParams.get("sort");

  let query = supabaseAdmin.from("pantry_items").select("*");
  if (Number.isFinite(ownerId)) {
    query = query.eq("owner_id", ownerId);
  }

  const isDesc = !sort || sort.endsWith(":desc");
  const { data, error } = await query.order("created_at", {
    ascending: !isDesc,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(withMeta((data || []).map(mapPantryItemRow)));
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin();
  const payload = await request.json();
  const body = payload?.data || {};

  const insertData = {
    name: body.name,
    quantity: body.quantity || "",
    image_url: body.imageUrl || "",
    owner_id: body.owner,
  };

  const { data, error } = await supabaseAdmin
    .from("pantry_items")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: mapPantryItemRow(data) }, { status: 201 });
}
