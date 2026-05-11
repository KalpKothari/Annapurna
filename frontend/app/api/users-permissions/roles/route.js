import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select("id, name, description, type")
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ roles: data || [] });
  } catch {
    // Fallback keeps auth bootstrapping functional before migrations are applied.
    return NextResponse.json({
      roles: [
        {
          id: 1,
          name: "Authenticated",
          description: "Default authenticated role",
          type: "authenticated",
        },
      ],
    });
  }

}
