import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { getPortalContext } from "@/lib/session";

/** Early ownership: remaining installments × current monthly value, paid in one Stripe payment. */
export async function POST() {
  const ctx = await getPortalContext();
  if (!ctx.companyId || ctx.role !== "owner") return NextResponse.redirect(`${SITE_URL}/cont/documente?e=role`, { status: 303 });
  const db = ctx.supabase;
  const [{ data: company }, { data: inst }] = await Promise.all([
    db.from("companies").select("id, stripe_customer_id, currency").eq("id", ctx.companyId).single(),
    db.from("installments").select("amount_net, status, currency").eq("company_id", ctx.companyId).neq("status", "paid"),
  ]);
  const remaining = (inst ?? []).reduce((a, r) => a + Number(r.amount_net), 0);
  const s = stripe();
  if (!s || !company?.stripe_customer_id || remaining <= 0) {
    await db.from("requests").insert({ company_id: ctx.companyId, created_by: ctx.user!.id, type: "billing", title: "Răscumpărare anticipată website", body: `Rate rămase: ${inst?.length ?? 0}. Valoare: ${remaining}.` });
    return NextResponse.redirect(`${SITE_URL}/cont/cereri?ok=buyout`, { status: 303 });
  }
  const cs = await s.checkout.sessions.create({
    mode: "payment",
    customer: company.stripe_customer_id,
    locale: "ro",
    line_items: [{ quantity: 1, price_data: { currency: company.currency.toLowerCase(), unit_amount: Math.round(remaining * 100), product_data: { name: `LUNAR · Răscumpărare anticipată (${inst!.length} rate)` } } }],
    metadata: { kind: "buyout", company_id: company.id },
    success_url: `${SITE_URL}/cont/documente?ok=buyout`,
    cancel_url: `${SITE_URL}/cont/documente`,
  });
  return NextResponse.redirect(cs.url!, { status: 303 });
}
