import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { SITE_URL } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { ADDONS, PLANS, cartLines } from "@/lib/plans";
import { provision } from "@/lib/provision";
import { money } from "@/lib/format";
import { sendEmail, templates } from "@/lib/email";
import { getRef } from "@/lib/ref";
import { discountFor, type Discount } from "@/lib/discount";

const Body = z.object({
  cui: z.string().trim().min(2).max(14),
  name: z.string().trim().min(2).max(200),
  regCom: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().min(3).max(300),
  contact: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  domain: z.string().trim().max(120).optional().default(""),
  vatPayer: z.boolean().default(true),
  paymentMode: z.enum(["card", "bank_transfer"]),
  currency: z.enum(["RON", "EUR"]),
  accept: z.literal(true),
  discountCode: z.string().trim().max(24).optional().default(""),
  cart: z.object({
    plan: z.enum(["essential", "growth", "partner"]),
    brand: z.boolean(),
    local: z.boolean(),
    langs: z.number().int().min(0).max(5),
  }),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Completează toate câmpurile obligatorii și acceptă contractul." }, { status: 400 });
  const d = parsed.data;
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const { net } = cartLines(d.cart, d.currency);

  // Codul de reducere se revalidează pe server, indiferent de ce a trimis browserul.
  let discount: Discount | null = null;
  if (d.discountCode) {
    const sb = await createClient();
    const { data: chk } = await sb.rpc("check_discount", { p_code: d.discountCode, p_plan: d.cart.plan });
    if (!chk?.valid) return NextResponse.json({ error: chk?.error || "Codul de reducere nu mai este valid." }, { status: 400 });
    discount = { id: chk.id, code: chk.code, kind: chk.kind, percent: chk.percent != null ? +chk.percent : null, amount_ron: chk.amount_ron != null ? +chk.amount_ron : null, amount_eur: chk.amount_eur != null ? +chk.amount_eur : null, months: chk.months, description: null };
  }
  const firstDisc = discountFor(discount, net, d.currency);
  const gross = net - firstDisc;
  const k = d.currency === "EUR" ? "eur" : "ron";
  const cur = d.currency.toLowerCase();

  // Always keep the order as a lead, so nothing is lost if a downstream service fails.
  const session = await createClient();
  const ref = await getRef();
  await session.rpc("submit_lead", {
    p_name: d.contact, p_email: d.email, p_phone: d.phone, p_company: `${d.name} (${d.cui})`, p_plan: d.cart.plan,
    p_message: `Checkout ${d.paymentMode} · ${money(net, d.currency)}/lună${discount ? ` · cod ${discount.code}` : ""} · domeniu ${d.domain || "—"}`, p_source: "checkout", p_ref: ref ?? "", p_meta: {},
  });

  const db = createAdminClient();
  const s = stripe();

  // ---------- card: Stripe Checkout (subscription) ----------
  if (d.paymentMode === "card" && s) {
    const customer = await s.customers.create({
      name: d.name,
      email: d.email,
      phone: d.phone || undefined,
      preferred_locales: ["ro"],
      address: { line1: d.address.slice(0, 200), country: "RO" },
      metadata: { cui: d.cui, reg_com: d.regCom, contact: d.contact },
    });
    const items = [
      { name: `LUNAR · Plan ${PLANS[d.cart.plan].name}`, amount: PLANS[d.cart.plan][k], qty: 1, code: d.cart.plan },
      ...(d.cart.brand ? [{ name: "LUNAR · Identitate vizuală (12 luni)", amount: ADDONS.brand[k], qty: 1, code: "brand" }] : []),
      ...(d.cart.local ? [{ name: "LUNAR · Vizibilitate locală Google", amount: ADDONS.local[k], qty: 1, code: "local" }] : []),
      ...(d.cart.langs ? [{ name: "LUNAR · Limbă suplimentară", amount: ADDONS.lang[k], qty: d.cart.langs, code: "lang" }] : []),
    ];
    const meta = {
      cui: d.cui, name: d.name.slice(0, 200), reg_com: d.regCom, address: d.address.slice(0, 300), contact: d.contact, email: d.email,
      phone: d.phone, domain: d.domain, vat_payer: String(d.vatPayer), currency: d.currency, cart: JSON.stringify(d.cart), ip: ip || "", ref: ref ?? "", discount: discount ? JSON.stringify(discount) : "",
    };
    let coupon: string | undefined;
    if (discount) {
      const c = await s.coupons.create({
        name: `LUNAR ${discount.code}`.slice(0, 40),
        duration: "repeating",
        duration_in_months: discount.months,
        ...(discount.kind === "percent"
          ? { percent_off: discount.percent! }
          : { amount_off: Math.round((d.currency === "EUR" ? discount.amount_eur! : discount.amount_ron!) * 100), currency: cur }),
        max_redemptions: 1,
        metadata: { code_id: discount.id, code: discount.code },
      });
      coupon = c.id;
    }
    const checkout = await s.checkout.sessions.create({
      mode: "subscription",
      ...(coupon ? { discounts: [{ coupon }] } : {}),
      customer: customer.id,
      locale: "ro",
      line_items: items.map((i) => ({
        quantity: i.qty,
        price_data: {
          currency: cur,
          unit_amount: Math.round(i.amount * 100),
          recurring: { interval: "month" },
          product_data: { name: i.name, metadata: { code: i.code } },
        },
      })),
      subscription_data: { metadata: meta, description: `LUNAR · ${d.name}` },
      metadata: meta,
      payment_method_collection: "always",
      billing_address_collection: "auto",
      success_url: `${SITE_URL}/comanda/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/#abonamente`,
    });
    return NextResponse.json({ url: checkout.url });
  }

  // ---------- bank transfer: provision now, pay by proforma ----------
  if (d.paymentMode === "bank_transfer" && db) {
    try {
      const res = await provision(db, {
        company: { cui: d.cui, name: d.name, regCom: d.regCom, address: d.address, vatPayer: d.vatPayer, contact: d.contact, email: d.email, phone: d.phone },
        domain: d.domain, cart: d.cart, currency: d.currency, mode: "bank_transfer", start: new Date(), firstPaid: false, ip, ref, discount,
      });
      const { data: bank } = await db.from("app_settings").select("value").eq("key", "bank").maybeSingle();
      const iban = (bank?.value as Record<string, string> | undefined)?.[d.currency === "EUR" ? "iban_eur" : "iban_ron"] || "";
      await sendEmail({ db, companyId: res.companyId, billing: true, template: "bank_order", to: d.email, subject: `Comanda LUNAR · referință ${res.bankReference}`,
        html: templates.bankOrder(d.contact, money(gross, d.currency, 2), res.bankReference!, iban) });
      await sendEmail({ db, template: "admin_order", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Comandă nouă (transfer): ${d.name}`,
        html: templates.adminNotice("Comandă nouă prin transfer bancar", { Firmă: d.name, CUI: d.cui, Plan: PLANS[d.cart.plan].name, Lunar: money(net, d.currency), Reducere: discount ? `${discount.code} · ${money(firstDisc, d.currency)} × ${discount.months}` : "", Email: d.email, Referință: res.bankReference }) });
      return NextResponse.json({ ok: true, message: `Comanda este înregistrată. Ți-am trimis pe email datele de plată și referința ${res.bankReference}. Te poți autentifica în portal cu ${d.email}.` });
    } catch (e) {
      console.error("[checkout] provision", e);
    }
  }

  // ---------- fallback: payments not configured yet ----------
  await sendEmail({ template: "admin_order", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Comandă nouă (manuală): ${d.name}`,
    html: templates.adminNotice("Comandă nouă de confirmat manual", { Firmă: d.name, CUI: d.cui, Adresă: d.address, Plan: PLANS[d.cart.plan].name, Lunar: money(net, d.currency), Reducere: discount ? `${discount.code} · ${money(firstDisc, d.currency)} × ${discount.months}` : "", Plată: d.paymentMode, Email: d.email, Telefon: d.phone, Domeniu: d.domain }),
    replyTo: d.email });
  return NextResponse.json({ ok: true, message: "Am primit comanda. Îți trimitem în cel mult o zi lucrătoare confirmarea și link-ul de plată." });
}

