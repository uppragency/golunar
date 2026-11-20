import { NextResponse } from "next/server";
import { createClient as createAnon } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { renderGrowth, type GrowthJob } from "@/lib/growth-emails";
import { unsubLinks } from "@/lib/unsub";

export const maxDuration = 60;

/** Recuperare checkout abandonat + nurturing. Apelat de pg_cron la 15 minute cu Authorization: Bearer CRON_SECRET. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const db = createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.rpc("growth_queue", { p_secret: secret });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stats: Record<string, number> = {};
  for (const j of (data ?? []) as GrowthJob[]) {
    const un = unsubLinks(j.email);
    const mail = renderGrowth(j, un.page);
    const id = await sendEmail({ template: j.kind, to: j.email, subject: mail.subject, html: mail.html, headers: un.headers });
    stats[j.kind] = (stats[j.kind] ?? 0) + (id ? 1 : 0);
  }
  return NextResponse.json({ ok: true, sent: stats });
}
