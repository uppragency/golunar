import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { getPortalContext } from "@/lib/session";

export async function POST() {
  const ctx = await getPortalContext();
  const s = stripe();
  if (!ctx.companyId || !s) return NextResponse.redirect(`${SITE_URL}/cont/metode?e=stripe`, { status: 303 });
  const { data: company } = await ctx.supabase.from("companies").select("stripe_customer_id").eq("id", ctx.companyId).single();
  if (!company?.stripe_customer_id || ctx.role === "viewer") return NextResponse.redirect(`${SITE_URL}/cont/metode?e=customer`, { status: 303 });
  const portal = await s.billingPortal.sessions.create({ customer: company.stripe_customer_id, return_url: `${SITE_URL}/cont/metode`, locale: "ro" });
  return NextResponse.redirect(portal.url, { status: 303 });
}
