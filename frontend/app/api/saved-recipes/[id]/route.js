import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(_request, { params }) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid saved recipe id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("saved_recipes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: null });
}
