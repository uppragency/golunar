import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  email: z.email().max(200),
  name: z.string().trim().max(120).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  currency: z.enum(["RON", "EUR"]).default("RON"),
  billing: z.enum(["monthly", "annual"]).default("monthly"),
  cart: z.object({ plan: z.enum(["essential", "growth", "partner"]), brand: z.boolean(), local: z.boolean(), langs: z.number().int().min(0).max(5) }),
});

/** Salvează comanda începută, ca să o putem aminti dacă nu e finalizată. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const d = parsed.data;
  const sb = await createClient();
  const { error } = await sb.rpc("save_checkout_draft", { p_email: d.email, p_name: d.name, p_company: d.company, p_cart: d.cart, p_currency: d.currency, p_billing: d.billing });
  if (error) console.error("[draft]", error.message);
  return NextResponse.json({ ok: true });
}
