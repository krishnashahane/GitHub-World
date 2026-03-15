import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isMockMode } from "@/lib/mock-data";

// POST: client heartbeat — upsert + prune + count via Postgres RPC
export async function POST(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({ count: 0 });
  }

  const body = await request.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
  if (!sessionId || sessionId.length > 64) {
    return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data: count, error } = await sb.rpc("heartbeat_visitor", {
    p_session_id: sessionId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 1 });
}

// GET: just return current count
export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ count: 0 });
  }

  const sb = getSupabaseAdmin();
  const { count, error } = await sb
    .from("site_visitors")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { count: count ?? 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
