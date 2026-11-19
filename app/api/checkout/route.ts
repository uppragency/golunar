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
  const { net, gross } = cartLines(d.cart, d.currency);
  const k = d.currency === "EUR" ? "eur" : "ron";
  const cur = d.currency.toLowerCase();

  // Always keep the order as a lead, so nothing is lost if a downstream service fails.
  const session = await createClient();
  await session.from("leads").insert({
    name: d.contact, email: d.email, phone: d.phone || null, company: `${d.name} (${d.cui})`, plan: d.cart.plan,
    message: `Checkout ${d.paymentMode} · ${money(net, d.currency)}/lună · domeniu ${d.domain || "—"}`, source: "checkout",
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
      phone: d.phone, domain: d.domain, vat_payer: String(d.vatPayer), currency: d.currency, cart: JSON.stringify(d.cart), ip: ip || "",
    };
    const vatRate = await ensureVatRate(s);
    const checkout = await s.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      locale: "ro",
      line_items: items.map((i) => ({
        quantity: i.qty,
        tax_rates: [vatRate],
        price_data: {
          currency: cur,
          unit_amount: Math.round(i.amount * 100),
          recurring: { interval: "month" },
          tax_behavior: "exclusive",
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
        domain: d.domain, cart: d.cart, currency: d.currency, mode: "bank_transfer", start: new Date(), firstPaid: false, ip,
      });
      const { data: bank } = await db.from("app_settings").select("value").eq("key", "bank").maybeSingle();
      const iban = (bank?.value as Record<string, string> | undefined)?.[d.currency === "EUR" ? "iban_eur" : "iban_ron"] || "";
      await sendEmail({ db, companyId: res.companyId, billing: true, template: "bank_order", to: d.email, subject: `Comanda LUNAR · referință ${res.bankReference}`,
        html: templates.bankOrder(d.contact, money(gross, d.currency, 2), res.bankReference!, iban) });
      await sendEmail({ db, template: "admin_order", to: process.env.ADMIN_NOTIFY_EMAIL || "golunar2027@gmail.com", subject: `Comandă nouă (transfer): ${d.name}`,
        html: templates.adminNotice("Comandă nouă prin transfer bancar", { Firmă: d.name, CUI: d.cui, Plan: PLANS[d.cart.plan].name, Lunar: money(net, d.currency), Email: d.email, Referință: res.bankReference }) });
      return NextResponse.json({ ok: true, message: `Comanda este înregistrată. Ți-am trimis pe email datele de plată și referința ${res.bankReference}. Te poți autentifica în portal cu ${d.email}.` });
    } catch (e) {
      console.error("[checkout] provision", e);
    }
  }

  // ---------- fallback: payments not configured yet ----------
  await sendEmail({ template: "admin_order", to: process.env.ADMIN_NOTIFY_EMAIL || "golunar2027@gmail.com", subject: `Comandă nouă (manuală): ${d.name}`,
    html: templates.adminNotice("Comandă nouă de confirmat manual", { Firmă: d.name, CUI: d.cui, Adresă: d.address, Plan: PLANS[d.cart.plan].name, Lunar: money(net, d.currency), Plată: d.paymentMode, Email: d.email, Telefon: d.phone, Domeniu: d.domain }),
    replyTo: d.email });
  return NextResponse.json({ ok: true, message: "Am primit comanda. Îți trimitem în cel mult o zi lucrătoare confirmarea și link-ul de plată." });
}

async function ensureVatRate(s: NonNullable<ReturnType<typeof stripe>>) {
  const list = await s.taxRates.list({ active: true, limit: 100 });
  const found = list.data.find((t) => t.metadata?.lunar === "vat21");
  if (found) return found.id;
  const created = await s.taxRates.create({ display_name: "TVA", percentage: 21, inclusive: false, country: "RO", jurisdiction: "RO", tax_type: "vat", metadata: { lunar: "vat21" } });
  return created.id;
}
