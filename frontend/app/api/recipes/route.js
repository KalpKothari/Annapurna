import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function mapRecipeRow(row) {
  return {
    id: row.id,
    documentId: String(row.id),
    title: row.title,
    description: row.description,
    cuisine: row.cuisine,
    category: row.category,
    ingredients: row.ingredients,
    instructions: row.instructions,
    imageUrl: row.image_url,
    isPublic: row.is_public,
    author: row.author_id,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    nutrition: row.nutrition,
    tips: row.tips,
    substitutions: row.substitutions,
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
  const titleFilter = searchParams.get("filters[title][$eqi]");

  let query = supabaseAdmin.from("recipes").select("*");

  if (titleFilter) {
    query = query.ilike("title", titleFilter);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(withMeta((data || []).map(mapRecipeRow)));
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin();
  const payload = await request.json();
  const body = payload?.data || {};

  const insertData = {
    title: body.title,
    description: body.description,
    cuisine: body.cuisine,
    category: body.category,
    ingredients: body.ingredients,
    instructions: body.instructions,
    image_url: body.imageUrl || "",
    is_public: body.isPublic ?? false,
    author_id: body.author,
    prep_time: body.prepTime ?? null,
    cook_time: body.cookTime ?? null,
    servings: body.servings ?? null,
    nutrition: body.nutrition ?? null,
    tips: body.tips ?? null,
    substitutions: body.substitutions ?? null,
  };

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: mapRecipeRow(data) }, { status: 201 });
}
