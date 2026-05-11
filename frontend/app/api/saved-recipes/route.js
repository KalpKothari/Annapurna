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

function mapSavedRecipeRow(row, includeRecipe) {
  // Handle both array and object formats from Supabase joins
  let recipe = row.recipe_id;
  if (includeRecipe && (row.recipe || row.recipes)) {
    // If join result is an array, take first element; if object, use directly
    const joinedRecipe = row.recipe || row.recipes;
    const recipeData = Array.isArray(joinedRecipe)
      ? joinedRecipe[0]
      : joinedRecipe;
    recipe = mapRecipeRow(recipeData);
  }
  
  return {
    id: row.id,
    documentId: String(row.id),
    savedAt: row.saved_at,
    user: row.user_id,
    recipe: recipe,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

function parseNumericFilter(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = parseNumericFilter(searchParams.get("filters[user][id][$eq]"));
    const recipeId = parseNumericFilter(searchParams.get("filters[recipe][id][$eq]"));
    const includeRecipe = searchParams.has("populate[recipe][populate]");
    const sort = searchParams.get("sort");

    console.log("📖 Fetching saved recipes - userId:", userId, "recipeId:", recipeId, "includeRecipe:", includeRecipe);

    let query = supabaseAdmin
      .from("saved_recipes")
      .select(includeRecipe ? "*, recipe:recipes(*)" : "*");

    if (Number.isFinite(userId)) {
      query = query.eq("user_id", userId);
    }

    if (Number.isFinite(recipeId)) {
      query = query.eq("recipe_id", recipeId);
    }

    const sortColumn = sort?.startsWith("savedAt") ? "saved_at" : "created_at";
    const isDesc = !sort || sort.endsWith(":desc");

    const { data, error } = await query.order(sortColumn, { ascending: !isDesc });

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedData = (data || []).map((row) => mapSavedRecipeRow(row, includeRecipe));
    console.log(`✅ Found ${mappedData.length} saved recipes`);

    return NextResponse.json(withMeta(mappedData));
  } catch (err) {
    console.error("❌ GET /api/saved-recipes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const payload = await request.json();
    const body = payload?.data || {};
    const userId = Number(body.user);
    const recipeId = Number(body.recipe);

    console.log("💾 Saving recipe - user:", userId, "recipe:", recipeId);

    if (!Number.isFinite(userId) || !Number.isFinite(recipeId)) {
      console.error("❌ Missing user or recipe ID");
      return NextResponse.json({ error: "Missing user or recipe ID" }, { status: 400 });
    }

    const insertData = {
      user_id: userId,
      recipe_id: recipeId,
      saved_at: body.savedAt || new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("saved_recipes")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      // Idempotent save: if relation already exists, return existing row.
      if (error.code === "23505") {
        const { data: existing, error: existingError } = await supabaseAdmin
          .from("saved_recipes")
          .select("*")
          .eq("user_id", userId)
          .eq("recipe_id", recipeId)
          .single();

        if (existingError) {
          console.error("❌ Supabase duplicate lookup error:", existingError);
          return NextResponse.json({ error: existingError.message }, { status: 400 });
        }

        return NextResponse.json({ data: mapSavedRecipeRow(existing, false) });
      }

      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("✅ Recipe saved with ID:", data?.id);
    return NextResponse.json({ data: mapSavedRecipeRow(data, false) }, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/saved-recipes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
