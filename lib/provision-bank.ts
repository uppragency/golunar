import "server-only";
import { createClient as createAnon } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { ADDONS, ANNUAL_OFF, PLANS, cartLines, hasAiAddon, round2, type Billing, type Cart, type Currency } from "@/lib/plans";
import { discountFor, type Discount } from "@/lib/discount";

export type BankOrder = {
  cui: string; name: string; regCom?: string; address?: string; vatPayer: boolean; contact: string; email: string; phone?: string;
  domain?: string; cart: Cart; currency: Currency; ip?: string | null; ref?: string | null; discount?: Discount | null; billing?: Billing;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addMonths = (d: Date, n: number, day: number) => {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  x.setUTCDate(day);
  return x;
};

/** Creează firma, abonamentul, cele 12 rate, documentele și invitația, prin funcția Postgres protejată cu CRON_SECRET. */
export async function provisionBankOrder(o: BankOrder) {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET missing");
  const k = o.currency === "EUR" ? "eur" : "ron";
  const start = new Date();
  const day = Math.min(28, start.getUTCDate());
  const { net } = cartLines(o.cart, o.currency);
  const planAmt = PLANS[o.cart.plan][k];
  const disc = discountFor(o.discount ?? null, net, o.currency);
  const annual = o.billing === "annual";
  // Plata anuală: o singură rată cu anul întreg (ratele 2–12 se adaugă ca incluse când rata 1 e plătită).
  const installments = annual
    ? [{ number: 1, due_date: iso(start), amount_plan: planAmt * 12, amount_addons: (net - planAmt) * 12, amount_discount: round2(net * 12 * ANNUAL_OFF) }]
    : Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        due_date: iso(i === 0 ? start : addMonths(start, i, day)),
        amount_plan: planAmt,
        amount_addons: net - planAmt,
        amount_discount: i < (o.discount?.months ?? 0) ? disc : 0,
      }));
  const items = [
    ...(o.cart.brand ? [{ addon: "brand", quantity: 1, unit_price: ADDONS.brand[k], max_cycles: 12 }] : []),
    ...(o.cart.local ? [{ addon: "local", quantity: 1, unit_price: ADDONS.local[k], max_cycles: "" }] : []),
    ...(hasAiAddon(o.cart) ? [{ addon: "ai", quantity: 1, unit_price: ADDONS.ai[k], max_cycles: "" }] : []),
    ...(o.cart.langs > 0 ? [{ addon: "lang", quantity: o.cart.langs, unit_price: ADDONS.lang[k], max_cycles: "" }] : []),
  ];
  const db = createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.rpc("provision_bank_order", {
    p_secret: secret,
    p: {
      cui: o.cui, name: o.name, reg_com: o.regCom ?? "", address: o.address ?? "", vat_payer: o.vatPayer, contact: o.contact, email: o.email, phone: o.phone ?? "",
      currency: o.currency, plan: o.cart.plan, min_months: PLANS[o.cart.plan].minMonths, items, installments, domain: o.domain ?? "",
      ip: o.ip ?? "", ref: o.ref ?? "", discount: annual ? null : o.discount ?? null, billing_cycle: annual ? "annual" : "monthly",
    },
  });
  if (error) throw new Error(error.message);
  const r = data as { error?: string; company_id: string; subscription_id: string; bank_reference: string; has_account: boolean };
  return { ...r, firstAmount: installments[0].amount_plan + installments[0].amount_addons - installments[0].amount_discount };
}
