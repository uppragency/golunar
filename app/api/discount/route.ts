import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({ code: z.string().trim().min(3).max(24).regex(/^[A-Za-z0-9_-]+$/), plan: z.enum(["essential", "growth", "partner"]) });

// Limită simplă împotriva ghicirii codurilor: 20 de încercări / 10 minute / IP, per instanță.
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = ((await headers()).get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  if (list.length >= 20) return NextResponse.json({ valid: false, error: "Prea multe încercări. Reîncearcă în câteva minute." }, { status: 429 });
  hits.set(ip, [...list, now]);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ valid: false, error: "Codul nu este valid." }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_discount", { p_code: parsed.data.code, p_plan: parsed.data.plan });
  if (error) return NextResponse.json({ valid: false, error: "Nu am putut verifica codul. Încearcă din nou." }, { status: 500 });
  return NextResponse.json(data);
}
