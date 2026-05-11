import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function mapRecipeRow(row) {
  if (!row) return null;
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

export async function GET(request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid recipe id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json({ data: mapRecipeRow(data) });
}

export async function PUT(request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid recipe id" }, { status: 400 });
  }

  const payload = await request.json();
  const body = payload?.data || {};

  const updateData = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.cuisine !== undefined) updateData.cuisine = body.cuisine;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.ingredients !== undefined) updateData.ingredients = body.ingredients;
  if (body.instructions !== undefined) updateData.instructions = body.instructions;
  if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
  if (body.prepTime !== undefined) updateData.prep_time = body.prepTime;
  if (body.cookTime !== undefined) updateData.cook_time = body.cookTime;
  if (body.servings !== undefined) updateData.servings = body.servings;
  if (body.nutrition !== undefined) updateData.nutrition = body.nutrition;
  if (body.tips !== undefined) updateData.tips = body.tips;
  if (body.substitutions !== undefined) updateData.substitutions = body.substitutions;

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: mapRecipeRow(data) });
}

export async function DELETE(request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid recipe id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("recipes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: null });
}
