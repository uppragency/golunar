import { NextResponse } from "next/server";
import { createClient as createAnon } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { checkSite } from "@/lib/tech-check";

export const maxDuration = 300;

/** Raport tehnic lunar (ziua 1, 06:00): viteză, SSL, status HTTP, linkuri rupte pentru toate site-urile. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const db = createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.rpc("tech_sites", { p_secret: secret });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const sites = (data ?? []) as { id: string; domain: string }[];
  let done = 0;
  for (let i = 0; i < sites.length; i += 3) {
    await Promise.all(sites.slice(i, i + 3).map(async (s) => {
      const r = await checkSite(s.domain);
      await db.rpc("tech_save", { p_secret: secret, p_id: s.id, p: r });
      done++;
    }));
  }
  return NextResponse.json({ ok: true, checked: done });
}
