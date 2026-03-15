import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isMockMode } from "@/lib/mock-data";

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ items: [] });
  }

  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("items")
    .select("*")
    .eq("is_active", true)
    .order("category")
    .order("price_usd_cents");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }

  return NextResponse.json(
    { items: data ?? [] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
