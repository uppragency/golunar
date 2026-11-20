import { NextResponse } from "next/server";
import { createClient as createAnon } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { unsubValid } from "@/lib/unsub";

/** Dezabonare cu un click (antetul List-Unsubscribe-Post, RFC 8058). */
export async function POST(req: Request) {
  const u = new URL(req.url);
  const email = u.searchParams.get("e") || "", t = u.searchParams.get("t") || "";
  if (!unsubValid(email, t)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const db = createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await db.rpc("email_unsubscribe", { p_secret: process.env.CRON_SECRET, p_email: email, p_source: "one-click" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
