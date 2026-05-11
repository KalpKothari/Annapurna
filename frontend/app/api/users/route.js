import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function mapUserRow(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    confirmed: user.confirmed,
    blocked: user.blocked,
    role: user.role_id,
    clerkId: user.clerk_id,
    firstName: user.first_name,
    lastName: user.last_name,
    imageUrl: user.image_url,
    subscriptionTier: user.subscription_tier,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function GET(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log("📋 GET /api/users - Fetching all users");

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("❌ Supabase error fetching users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedUsers = (data || []).map(mapUserRow);
    console.log(`✅ Found ${mappedUsers.length} users`);
    
    return NextResponse.json(mappedUsers);
  } catch (err) {
    console.error("❌ GET /api/users error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const payload = await request.json();

    console.log("👤 POST /api/users - Creating user:", payload.email);

    const insertData = {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      confirmed: payload.confirmed ?? true,
      blocked: payload.blocked ?? false,
      role_id: payload.role ?? 1,
      clerk_id: payload.clerkId,
      first_name: payload.firstName ?? "",
      last_name: payload.lastName ?? "",
      image_url: payload.imageUrl ?? "",
      subscription_tier: payload.subscriptionTier ?? "free",
    };

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      console.error("❌ Supabase error creating user:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("✅ User created with ID:", data?.id);
    return NextResponse.json(mapUserRow(data), { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/users error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
