import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { provision } from "@/lib/provision";
import { createSmartbillInvoice } from "@/lib/smartbill";
import { sendEmail, templates } from "@/lib/email";
import { money } from "@/lib/format";
import type { Cart, Currency } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const s = stripe();
  const db = createAdminClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !db || !secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(raw, sig!, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  // Idempotency: the unique (source, external_id) makes a replayed event a no-op.
  const { error: dupErr } = await db.from("events").insert({ source: "stripe", external_id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> });
  if (dupErr) {
    const { data: prev } = await db.from("events").select("processed_at").eq("source", "stripe").eq("external_id", event.id).maybeSingle();
    if (prev?.processed_at) return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        if (cs.mode === "subscription" && cs.subscription) {
          const sub = await s.subscriptions.retrieve(String(cs.subscription));
          const { companyId, created } = await ensureProvisioned(db, sub, cs.payment_status === "paid");
          await syncPaymentMethods(s, db, String(cs.customer), companyId);
          if (created) {
            const email = sub.metadata.email;
            await sendEmail({ db, companyId, template: "welcome", to: email, subject: "Bun venit la LUNAR · următorul pas: brief-ul", html: templates.welcome(sub.metadata.contact || sub.metadata.name) });
            await sendEmail({ db, template: "admin_order", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Client nou (card): ${sub.metadata.name}`,
              html: templates.adminNotice("Client nou prin card", { Firmă: sub.metadata.name, CUI: sub.metadata.cui, Email: email, Domeniu: sub.metadata.domain }) });
          }
        } else if (cs.mode === "payment" && cs.metadata?.kind === "buyout") {
          await handleBuyout(db, cs);
        }
        break;
      }
      case "invoice.paid": {
        await onInvoicePaid(s, db, event.data.object as Stripe.Invoice);
        break;
      }
      case "invoice.payment_failed": {
        await onInvoiceFailed(db, event.data.object as Stripe.Invoice);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const map: Record<string, string> = { active: "active", trialing: "active", past_due: "past_due", unpaid: "past_due", paused: "paused", canceled: "canceled", incomplete: "incomplete", incomplete_expired: "canceled" };
        await db.from("subscriptions").update({
          status: map[sub.status] ?? "active",
          cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
          canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        }).eq("stripe_subscription_id", sub.id);
        break;
      }
      case "payment_method.attached":
      case "payment_method.detached":
      case "customer.updated": {
        const obj = event.data.object as { customer?: string | null; id: string; object: string };
        const customerId = obj.object === "customer" ? obj.id : (obj.customer as string | null);
        if (customerId) {
          const { data: c } = await db.from("companies").select("id").eq("stripe_customer_id", customerId).maybeSingle();
          if (c) await syncPaymentMethods(s, db, customerId, c.id);
        }
        break;
      }
    }
    await db.from("events").update({ processed_at: new Date().toISOString(), error: null }).eq("source", "stripe").eq("external_id", event.id);
    return NextResponse.json({ received: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[stripe] ${event.type}`, msg);
    await db.from("events").update({ error: msg }).eq("source", "stripe").eq("external_id", event.id);
    return NextResponse.json({ error: "handler failed" }, { status: 500 }); // Stripe retries
  }
}

async function ensureProvisioned(db: SupabaseClient, sub: Stripe.Subscription, firstPaid: boolean) {
  const m = sub.metadata;
  const cart = JSON.parse(m.cart || "{}") as Cart;
  try {
    return await provision(db, {
      company: { cui: m.cui, name: m.name, regCom: m.reg_com, address: m.address, vatPayer: m.vat_payer !== "false", contact: m.contact, email: m.email, phone: m.phone },
      domain: m.domain, cart, currency: (m.currency as Currency) || "RON", mode: "card", start: new Date(sub.start_date * 1000), firstPaid,
      stripeCustomerId: String(sub.customer), stripeSubscriptionId: sub.id, ip: m.ip || null,
    });
  } catch (e) {
    // Concurrent webhook created it first.
    const { data } = await db.from("subscriptions").select("id, company_id").eq("stripe_subscription_id", sub.id).maybeSingle();
    if (data) return { companyId: data.company_id as string, subscriptionId: data.id as string, created: false };
    throw e;
  }
}

function invoiceSubscriptionId(inv: Stripe.Invoice): string | null {
  const anyInv = inv as unknown as { subscription?: string | { id: string } | null; parent?: { subscription_details?: { subscription?: string | { id: string } } } };
  const v = anyInv.parent?.subscription_details?.subscription ?? anyInv.subscription ?? null;
  return v ? (typeof v === "string" ? v : v.id) : null;
}

async function onInvoicePaid(s: Stripe, db: SupabaseClient, inv: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(inv);
  if (!subId) return;
  let { data: sub } = await db.from("subscriptions").select("id, company_id, currency").eq("stripe_subscription_id", subId).maybeSingle();
  if (!sub) {
    const stripeSub = await s.subscriptions.retrieve(subId);
    await ensureProvisioned(db, stripeSub, inv.billing_reason === "subscription_create");
    ({ data: sub } = await db.from("subscriptions").select("id, company_id, currency").eq("stripe_subscription_id", subId).maybeSingle());
    if (!sub) throw new Error("subscription not provisioned");
  }

  // Which installment does this invoice pay?
  let { data: inst } = await db.from("installments").select("*").eq("stripe_invoice_id", inv.id).maybeSingle();
  if (!inst) {
    const q = db.from("installments").select("*").eq("subscription_id", sub.id).order("number").limit(1);
    const { data } = inv.billing_reason === "subscription_create" ? await q.eq("number", 1) : await q.neq("status", "paid");
    inst = data?.[0] ?? null;
  }
  if (!inst) return; // beyond 12: continuation period, nothing to track yet

  const card = await cardLabel(s, inv);
  await db.from("installments").update({ status: "paid", paid_at: new Date().toISOString(), method: card, stripe_invoice_id: inv.id }).eq("id", inst.id);
  await db.from("subscriptions").update({ status: "active" }).eq("id", sub.id);
  await db.from("payment_attempts").insert({ company_id: sub.company_id, installment_id: inst.id, method_label: card, succeeded: true });

  const { data: company } = await db.from("companies").select("*").eq("id", sub.company_id).single();
  const currency = (sub.currency as Currency) || "RON";
  const total = (inv.amount_paid ?? 0) / 100;

  // Fiscal invoice: SmartBill → SPV. Falls back to a pending record when SmartBill is not configured.
  let series = "LNR", number = `S-${inv.number ?? inv.id.slice(-8)}`, spv = "pending";
  try {
    const sb = await createSmartbillInvoice({
      client: { name: company.name, vatCode: company.cui, regCom: company.reg_com, address: company.address, email: company.billing_email, isTaxPayer: company.vat_payer },
      currency, issueDate: new Date().toISOString().slice(0, 10), paid: true, paymentType: "Card",
      lines: (inv.lines?.data ?? []).map((l) => ({ name: l.description || "Abonament LUNAR", quantity: l.quantity ?? 1, price: (l.amount ?? 0) / 100 / (l.quantity || 1) })),
    });
    if (sb) { series = sb.series; number = sb.number; spv = "sent"; }
  } catch (e) {
    console.error("[smartbill]", e);
    spv = "error";
  }
  const period = new Date(inst.due_date).toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
  await db.from("invoices").upsert(
    { company_id: sub.company_id, installment_id: inst.id, smartbill_series: series, smartbill_number: number, issued_at: new Date().toISOString().slice(0, 10), period_label: period, total, currency, payment_label: card, spv_status: spv },
    { onConflict: "smartbill_series,smartbill_number" },
  );

  if (company.billing_email)
    await sendEmail({ db, companyId: sub.company_id, billing: true, template: `installment_paid_${inst.number}`, to: company.billing_email, subject: `Rata ${inst.number} din 12 încasată · LUNAR`, html: templates.paymentOk(money(total, currency, 2), inst.number) });

  if (inst.number === 12) {
    const { data: site } = await db.from("websites").select("id").eq("company_id", sub.company_id).limit(1).maybeSingle();
    if (site) await db.from("ownership").update({ transferred_at: new Date().toISOString().slice(0, 10) }).eq("website_id", site.id);
    // Brand add-on stops after 12 cycles.
    const stripeSub = await s.subscriptions.retrieve(subId, { expand: ["items.data.price.product"] });
    for (const item of stripeSub.items.data) {
      const product = item.price.product as Stripe.Product;
      if (product?.metadata?.code === "brand") await s.subscriptionItems.del(item.id, { proration_behavior: "none" });
    }
    await db.from("subscription_items").delete().eq("subscription_id", sub.id).eq("addon", "brand");
  }
}

async function onInvoiceFailed(db: SupabaseClient, inv: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(inv);
  if (!subId) return;
  const { data: sub } = await db.from("subscriptions").select("id, company_id, currency").eq("stripe_subscription_id", subId).maybeSingle();
  if (!sub) return;
  const { data } = await db.from("installments").select("id, number").eq("subscription_id", sub.id).neq("status", "paid").order("number").limit(1);
  const inst = data?.[0];
  if (inst) await db.from("installments").update({ status: "failed", stripe_invoice_id: inv.id }).eq("id", inst.id);
  await db.from("subscriptions").update({ status: "past_due" }).eq("id", sub.id);
  await db.from("payment_attempts").insert({ company_id: sub.company_id, installment_id: inst?.id ?? null, method_label: "Card", succeeded: false, failure_reason: inv.last_finalization_error?.code ?? "declined" });
  const { data: company } = await db.from("companies").select("billing_email").eq("id", sub.company_id).single();
  if (company?.billing_email && (inv.attempt_count ?? 1) <= 1)
    await sendEmail({ db, companyId: sub.company_id, billing: true, template: "payment_failed", to: company.billing_email, subject: "Plata LUNAR nu a trecut · actualizează cardul", html: templates.paymentFailed(money((inv.amount_due ?? 0) / 100, sub.currency as Currency, 2)) });
}

async function handleBuyout(db: SupabaseClient, cs: Stripe.Checkout.Session) {
  const companyId = cs.metadata?.company_id;
  if (!companyId) return;
  const { data: subs } = await db.from("subscriptions").select("id").eq("company_id", companyId).order("created_at", { ascending: false }).limit(1);
  const subId = subs?.[0]?.id;
  if (!subId) return;
  await db.from("installments").update({ status: "paid", paid_at: new Date().toISOString(), method: "Răscumpărare" }).eq("subscription_id", subId).neq("status", "paid");
  const { data: site } = await db.from("websites").select("id").eq("company_id", companyId).limit(1).maybeSingle();
  if (site) await db.from("ownership").update({ transferred_at: new Date().toISOString().slice(0, 10), buyout_amount: (cs.amount_total ?? 0) / 100 }).eq("website_id", site.id);
}

async function cardLabel(s: Stripe, inv: Stripe.Invoice) {
  try {
    const anyInv = inv as unknown as { payment_intent?: string | null; payments?: { data?: { payment?: { payment_intent?: string } }[] } };
    const piId = anyInv.payment_intent ?? anyInv.payments?.data?.[0]?.payment?.payment_intent;
    if (!piId) return "Card";
    const pi = await s.paymentIntents.retrieve(piId, { expand: ["payment_method"] });
    const pm = pi.payment_method as Stripe.PaymentMethod | null;
    if (pm?.card) return `${pm.card.brand[0].toUpperCase()}${pm.card.brand.slice(1)} ${pm.card.last4}`;
  } catch {}
  return "Card";
}

async function syncPaymentMethods(s: Stripe, db: SupabaseClient, customerId: string, companyId: string) {
  const [pms, customer] = await Promise.all([
    s.paymentMethods.list({ customer: customerId, type: "card", limit: 20 }),
    s.customers.retrieve(customerId) as Promise<Stripe.Customer>,
  ]);
  const def = typeof customer.invoice_settings?.default_payment_method === "string" ? customer.invoice_settings.default_payment_method : customer.invoice_settings?.default_payment_method?.id;
  await db.from("payment_methods").delete().eq("company_id", companyId).not("stripe_payment_method_id", "in", `(${pms.data.map((p) => `"${p.id}"`).join(",") || '""'})`);
  if (pms.data.length)
    await db.from("payment_methods").upsert(
      pms.data.map((p, i) => ({ company_id: companyId, stripe_payment_method_id: p.id, brand: p.card!.brand, last4: p.card!.last4, exp_month: p.card!.exp_month, exp_year: p.card!.exp_year, is_default: def ? p.id === def : i === 0 })),
      { onConflict: "stripe_payment_method_id" },
    );
}
