import "server-only";
import { cache } from "react";
import { getPortalContext } from "@/lib/session";
import { PLANS, ADDONS, type Currency, type PlanCode } from "@/lib/plans";

export type Installment = { id: string; number: number; due_date: string; amount_plan: number; amount_addons: number; amount_discount: number; amount_net: number; vat_rate: number; currency: Currency; status: "scheduled" | "paid" | "failed" | "overdue"; paid_at: string | null; method: string | null };

export const getPortalData = cache(async () => {
  const ctx = await getPortalContext();
  if (!ctx.companyId) return { ready: false as const, ctx, company: null };
  const db = ctx.supabase;
  const id = ctx.companyId;
  const [company, subs, items, inst, invoices, sites, metrics, requests, docs, pms, attempts, launch, own, bank] = await Promise.all([
    db.from("companies").select("*").eq("id", id).single(),
    db.from("subscriptions").select("*").eq("company_id", id).order("created_at", { ascending: false }).limit(1),
    db.from("subscription_items").select("*").eq("company_id", id),
    db.from("installments").select("*").eq("company_id", id).order("number"),
    db.from("invoices").select("*").eq("company_id", id).order("issued_at", { ascending: false }),
    db.from("websites").select("*").eq("company_id", id).order("created_at").limit(1),
    db.from("website_metrics").select("*").eq("company_id", id).order("month"),
    db.from("requests").select("*").eq("company_id", id).order("created_at", { ascending: false }),
    db.from("documents").select("*").eq("company_id", id).order("created_at"),
    db.from("payment_methods").select("*").eq("company_id", id).order("is_default", { ascending: false }),
    db.from("payment_attempts").select("*").eq("company_id", id).order("attempted_at", { ascending: false }).limit(8),
    db.from("launch_projects").select("*").eq("company_id", id).maybeSingle(),
    db.from("ownership").select("*").eq("company_id", id).maybeSingle(),
    db.from("app_settings").select("value").eq("key", "bank").maybeSingle(),
  ]);
  const sub = subs.data?.[0] ?? null;
  const installments = (inst.data ?? []).map((r) => ({ ...r, amount_plan: +r.amount_plan, amount_addons: +r.amount_addons, amount_discount: +(r.amount_discount ?? 0), amount_net: +r.amount_net, vat_rate: +r.vat_rate })) as Installment[];
  const currency: Currency = (sub?.currency ?? company.data?.currency ?? "RON") as Currency;
  const paid = installments.filter((i) => i.status === "paid");
  const open = installments.filter((i) => i.status !== "paid");
  const next = open[0] ?? null;
  const year = new Date().getFullYear();
  const remainingYear = open.filter((i) => new Date(i.due_date).getFullYear() === year);
  const overdue = installments.filter((i) => i.status === "failed" || i.status === "overdue");
  const plan = (sub?.plan ?? "essential") as PlanCode;
  const monthBucket = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10);
  const reqs = requests.data ?? [];
  const usedThisMonth = reqs.filter((r) => r.type === "improvement" && r.month_bucket === monthBucket && r.status !== "rejected").length;
  const addonNames = (items.data ?? []).map((i) => (i.addon === "lang" ? `${i.quantity} ${i.quantity > 1 ? "limbi" : "limbă"}` : ADDONS[i.addon as keyof typeof ADDONS].name));

  if (!company.data) return { ready: false as const, ctx, company: null };
  return {
    ready: true as const,
    ctx,
    company: company.data as Record<string, any>,
    sub,
    plan,
    planName: PLANS[plan].name,
    addonNames,
    items: items.data ?? [],
    currency,
    installments,
    paid,
    open,
    next,
    overdue,
    sum: (list: Installment[]) => list.reduce((a, i) => a + i.amount_net, 0),
    remainingYear,
    invoices: invoices.data ?? [],
    site: sites.data?.[0] ?? null,
    metrics: metrics.data ?? [],
    requests: reqs,
    quota: PLANS[plan].improvements,
    usedThisMonth,
    docs: docs.data ?? [],
    pms: pms.data ?? [],
    attempts: attempts.data ?? [],
    launch: launch.data,
    ownership: own.data,
    bank: (bank.data?.value ?? {}) as { iban_eur?: string; iban_ron?: string; bank?: string; beneficiary?: string },
  };
});
