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

export async function PUT(request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const payload = await request.json();
  const updateData = {};

  if (payload.clerkId !== undefined) updateData.clerk_id = payload.clerkId;
  if (payload.subscriptionTier !== undefined) {
    updateData.subscription_tier = payload.subscriptionTier;
  }
  if (payload.firstName !== undefined) updateData.first_name = payload.firstName;
  if (payload.lastName !== undefined) updateData.last_name = payload.lastName;
  if (payload.imageUrl !== undefined) updateData.image_url = payload.imageUrl;

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(mapUserRow(data));
}
