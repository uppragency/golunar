import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADDONS, PLANS, cartLines, type Cart, type Currency } from "@/lib/plans";

export type ProvisionInput = {
  company: { cui: string; name: string; regCom?: string; address?: string; vatPayer: boolean; contact: string; email: string; phone?: string };
  domain?: string;
  cart: Cart;
  currency: Currency;
  mode: "card" | "bank_transfer";
  start: Date;
  firstPaid: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  ip?: string | null;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addMonths = (d: Date, n: number, day: number) => {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  x.setUTCDate(day);
  return x;
};
const normCui = (c: string) => {
  const digits = c.replace(/\D/g, "");
  return /^\s*ro/i.test(c) ? `RO${digits}` : digits;
};

/** Creates company, subscription, items, 12 installments, website, ownership, documents and the owner invite. Idempotent on stripe_subscription_id. */
export async function provision(db: SupabaseClient, input: ProvisionInput) {
  if (input.stripeSubscriptionId) {
    const { data: existing } = await db.from("subscriptions").select("id, company_id").eq("stripe_subscription_id", input.stripeSubscriptionId).maybeSingle();
    if (existing) return { companyId: existing.company_id as string, subscriptionId: existing.id as string, created: false };
  }
  const k = input.currency === "EUR" ? "eur" : "ron";
  const cui = normCui(input.company.cui);

  const { data: company, error: cErr } = await db
    .from("companies")
    .upsert(
      {
        cui,
        name: input.company.name,
        reg_com: input.company.regCom || null,
        address: input.company.address || null,
        vat_payer: input.company.vatPayer,
        legal_rep: input.company.contact,
        billing_email: input.company.email,
        notify_email: input.company.email,
        phone: input.company.phone || null,
        currency: input.currency,
        ...(input.stripeCustomerId ? { stripe_customer_id: input.stripeCustomerId } : {}),
      },
      { onConflict: "cui" },
    )
    .select("id, bank_reference")
    .single();
  if (cErr || !company) throw new Error(`company: ${cErr?.message}`);

  const day = Math.min(28, input.start.getUTCDate());
  const { data: sub, error: sErr } = await db
    .from("subscriptions")
    .insert({
      company_id: company.id,
      plan: input.cart.plan,
      status: input.firstPaid ? "active" : "incomplete",
      payment_mode: input.mode,
      currency: input.currency,
      billing_day: day,
      started_at: input.start.toISOString(),
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      min_commitment_months: input.cart.plan === "essential" ? 3 : 0,
    })
    .select("id")
    .single();
  if (sErr || !sub) throw new Error(`subscription: ${sErr?.message}`);

  const items: { addon: string; quantity: number; unit_price: number; max_cycles: number | null }[] = [];
  if (input.cart.brand) items.push({ addon: "brand", quantity: 1, unit_price: ADDONS.brand[k], max_cycles: 12 });
  if (input.cart.local) items.push({ addon: "local", quantity: 1, unit_price: ADDONS.local[k], max_cycles: null });
  if (input.cart.langs > 0) items.push({ addon: "lang", quantity: input.cart.langs, unit_price: ADDONS.lang[k], max_cycles: null });
  if (items.length) {
    const { error } = await db.from("subscription_items").insert(items.map((i) => ({ ...i, subscription_id: sub.id, company_id: company.id })));
    if (error) throw new Error(`items: ${error.message}`);
  }

  const { net } = cartLines(input.cart, input.currency);
  const planAmt = PLANS[input.cart.plan][k];
  const rows = Array.from({ length: 12 }, (_, i) => ({
    subscription_id: sub.id,
    company_id: company.id,
    number: i + 1,
    due_date: iso(i === 0 ? input.start : addMonths(input.start, i, day)),
    amount_plan: planAmt,
    amount_addons: net - planAmt,
    currency: input.currency,
    status: i === 0 && input.firstPaid ? "paid" : "scheduled",
    paid_at: i === 0 && input.firstPaid ? new Date().toISOString() : null,
    method: i === 0 && input.firstPaid ? "Card" : null,
  }));
  const { error: iErr } = await db.from("installments").insert(rows);
  if (iErr) throw new Error(`installments: ${iErr.message}`);

  const domain = (input.domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || `${cui.toLowerCase()}.golunar.ro`;
  const { data: site, error: wErr } = await db
    .from("websites")
    .upsert({ company_id: company.id, domain, status: input.firstPaid ? "building" : "onboarding" }, { onConflict: "domain" })
    .select("id")
    .single();
  if (wErr || !site) throw new Error(`website: ${wErr?.message}`);

  await db.from("ownership").upsert({ website_id: site.id, company_id: company.id, eligible_at: iso(addMonths(input.start, 11, day)) });
  if (input.firstPaid) await startLaunch(db, site.id, company.id);

  const signedAt = new Date().toISOString();
  await db.from("documents").insert([
    { company_id: company.id, kind: "contract", title: `Contract abonament ${company.bank_reference}`, signed_at: signedAt, signed_ip: input.ip || null },
    { company_id: company.id, kind: "annex", title: `Anexa 1 · Plan ${PLANS[input.cart.plan].name} și opțiuni`, signed_at: signedAt, signed_ip: input.ip || null },
    { company_id: company.id, kind: "dpa", title: "Acord de prelucrare date (GDPR)", signed_at: signedAt, signed_ip: input.ip || null },
    { company_id: company.id, kind: "handover", title: "Proces-verbal transfer proprietate", locked_until_installment: 12 },
    { company_id: company.id, kind: "source", title: "Cod-sursă și fișiere", locked_until_installment: 12 },
  ]);

  const { error: invErr } = await db.rpc("invite_member", { p_email: input.company.email, p_company: company.id, p_role: "owner" });
  if (invErr) console.error("[provision] invite", invErr.message);

  return { companyId: company.id as string, subscriptionId: sub.id as string, bankReference: company.bank_reference as string, created: true };
}

export async function startLaunch(db: SupabaseClient, websiteId: string, companyId: string) {
  const due = new Date();
  let n = 10;
  while (n > 0) {
    due.setDate(due.getDate() + 1);
    const w = due.getDay();
    if (w && w !== 6) n--;
  }
  await db.from("launch_projects").upsert(
    { website_id: websiteId, company_id: companyId, day_counter: 1, stage: "brief", started_at: iso(new Date()), due_at: iso(due) },
    { onConflict: "website_id", ignoreDuplicates: true },
  );
  await db.from("websites").update({ status: "building" }).eq("id", websiteId).eq("status", "onboarding");
}
