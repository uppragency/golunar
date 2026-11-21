import { NextResponse, after } from "next/server";
import { syncContact } from "@/lib/contacts";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { PLANS, annualTotal, cartLines } from "@/lib/plans";
import { money } from "@/lib/format";
import { sendEmail, templates } from "@/lib/email";
import { getRef, getSource } from "@/lib/ref";
import { provisionBankOrder } from "@/lib/provision-bank";
import { PAYEE } from "@/lib/bank";
import { discountFor, type Discount } from "@/lib/discount";
import { createClient as createAnon } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { reportError } from "@/lib/report";

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
  billing: z.enum(["monthly", "annual"]).default("monthly"),
  cart: z.object({
    plan: z.enum(["essential", "growth", "partner"]),
    brand: z.boolean(),
    local: z.boolean(),
    ai: z.boolean().optional().default(false),
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
  const annual = d.billing === "annual";
  let discount: Discount | null = null;
  if (d.discountCode && !annual) {
    const sb = await createClient();
    const { data: chk } = await sb.rpc("check_discount_for", { p_code: d.discountCode, p_plan: d.cart.plan, p_cui: d.cui });
    if (!chk?.valid) return NextResponse.json({ error: chk?.error || "Codul de reducere nu mai este valid." }, { status: 400 });
    discount = { id: chk.id, code: chk.code, kind: chk.kind, percent: chk.percent != null ? +chk.percent : null, amount_ron: chk.amount_ron != null ? +chk.amount_ron : null, amount_eur: chk.amount_eur != null ? +chk.amount_eur : null, months: chk.months, description: null };
  }
  const firstDisc = discountFor(discount, net, d.currency);
  const yearly = annualTotal(d.cart, d.currency);
  const gross = net - firstDisc;

  // Always keep the order as a lead, so nothing is lost if a downstream service fails.
  const session = await createClient();
  const ref = await getRef();
  await session.rpc("submit_lead", {
    p_name: d.contact, p_email: d.email, p_phone: d.phone, p_company: `${d.name} (${d.cui})`, p_plan: d.cart.plan,
    p_message: `Checkout ${d.paymentMode}${annual ? ` · ANUAL ${money(yearly.total, d.currency, 2)}` : ""} · ${money(net, d.currency)}/lună${discount ? ` · cod ${discount.code}` : ""} · domeniu ${d.domain || "—"}`, p_source: "checkout", p_ref: ref ?? "", p_meta: { src: await getSource(), cui: d.cui, discount: discount?.code ?? null, billing: d.billing },
  });

  // Momentan acceptăm doar transfer bancar.
  if (d.paymentMode !== "bank_transfer") return NextResponse.json({ error: "Momentan acceptăm doar plata prin transfer bancar." }, { status: 400 });

  try {
    const res = await provisionBankOrder({
      cui: d.cui, name: d.name, regCom: d.regCom, address: d.address, vatPayer: d.vatPayer, contact: d.contact, email: d.email, phone: d.phone,
      domain: d.domain, cart: d.cart, currency: d.currency, ip, ref, discount, billing: d.billing,
    });
    // Comanda a fost trimisă: oprim recuperarea și nurturing-ul pentru acest email.
    const secret = process.env.CRON_SECRET;
    if (secret) await createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } }).rpc("checkout_done", { p_secret: secret, p_email: d.email }).then(({ error }) => error && reportError("checkout-done", error));
    after(() => syncContact({ email: d.email, name: d.contact, phone: d.phone, kind: "client", tags: [`plan-${d.cart.plan}`, annual ? "plata-anuala" : "plata-lunara", ...(discount ? [`cod-${discount.code}`] : [])] }));
    if (res.error === "exists") {
      return NextResponse.json({ error: "Firma cu acest CUI are deja un cont LUNAR. Intră în cont sau scrie-ne la hello@golunar.ro." }, { status: 409 });
    }
    const amount = money(res.firstAmount, d.currency, 2);
    await sendEmail({ companyId: res.company_id, billing: true, template: "bank_order", to: d.email, subject: `Comanda LUNAR · referință ${res.bank_reference}`,
      html: templates.bankOrder(d.contact, amount, res.bank_reference, PAYEE.iban, d.email) });
    await sendEmail({ template: "admin_order", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", replyTo: d.email, subject: `Comandă nouă (transfer): ${d.name}`,
      html: templates.adminNotice(annual ? "Comandă nouă cu plată anuală (transfer)" : "Comandă nouă prin transfer bancar", { Firmă: d.name, CUI: d.cui, Plan: PLANS[d.cart.plan].name + (annual ? " · anual" : ""), Lunar: money(net, d.currency), "Prima rată": amount, Reducere: discount ? `${discount.code} · ${money(firstDisc, d.currency)} × ${discount.months}` : "", Email: d.email, Telefon: d.phone, Referință: res.bank_reference }) });
    const q = new URLSearchParams({ ref: res.bank_reference, suma: amount, lunar: money(net, d.currency), plan: PLANS[d.cart.plan].name + (annual ? " · plată anuală" : ""), ...(annual ? { anual: "1" } : {}), email: d.email, cont: res.has_account ? "1" : "0", v: String(res.firstAmount), m: String(net), cur: d.currency, pc: d.cart.plan });
    return NextResponse.json({ ok: true, redirect: `/comanda/multumim?${q}` });
  } catch (e) {
    reportError("checkout", e, { plan: d.cart.plan, billing: d.billing });
    await sendEmail({ template: "admin_order", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", replyTo: d.email, subject: `Comandă de procesat manual: ${d.name}`,
      html: templates.adminNotice("Comandă de confirmat manual (provizionare eșuată)", { Firmă: d.name, CUI: d.cui, Adresă: d.address, Plan: PLANS[d.cart.plan].name, Lunar: money(net, d.currency), Email: d.email, Telefon: d.phone, Domeniu: d.domain }) });
    return NextResponse.json({ ok: true, message: "Am primit comanda. Îți trimitem în cel mult o zi lucrătoare datele de plată și accesul în cont." });
  }
}
