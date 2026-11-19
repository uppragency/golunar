import "server-only";
import { cache } from "react";
import { requireAdmin } from "@/lib/session";
import { EUR_RON, PLANS, toEur, type Currency, type PlanCode } from "@/lib/plans";

export type ClientRow = {
  id: string; name: string; cui: string; domain: string; plan: PlanCode; planName: string; currency: Currency; mrr: number; mrrEur: number;
  paid: number; ownerDone: boolean; mode: "card" | "bank_transfer"; nextDue: string | null; status: "Activ" | "Restant" | "Lansare" | "Proprietar" | "Anulat";
  isDemo: boolean; startedAt: string | null; canceledAt: string | null; overdueAmount: number;
};

const monthKey = (d: string | Date) => new Date(d).toISOString().slice(0, 7);

export const getAdminData = cache(async () => {
  const s = await requireAdmin();
  const db = s.supabase;
  const [companies, subs, inst, sites, launches, requests, transfers, own] = await Promise.all([
    db.from("companies").select("id, name, cui, is_demo, currency, bank_reference, created_at"),
    db.from("subscriptions").select("*"),
    db.from("installments").select("id, company_id, subscription_id, number, due_date, amount_net, vat_rate, currency, status, paid_at, method"),
    db.from("websites").select("id, company_id, domain, status"),
    db.from("launch_projects").select("*, websites(domain), companies(name)"),
    db.from("requests").select("id, company_id, type, title, status, month_bucket, hours_spent, created_at, companies(name)").order("created_at", { ascending: false }),
    db.from("bank_transfers").select("*").order("received_at", { ascending: false }).limit(50),
    db.from("ownership").select("*"),
  ]);
  const I = (inst.data ?? []).map((r) => ({ ...r, amount_net: +r.amount_net, vat_rate: +r.vat_rate }));
  const subByCompany = new Map<string, Record<string, any>>();
  for (const sub of (subs.data ?? []).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))) subByCompany.set(sub.company_id, sub);
  const siteByCompany = new Map((sites.data ?? []).map((w) => [w.company_id, w]));
  const ownByCompany = new Map((own.data ?? []).map((o) => [o.company_id, o]));

  const clients: ClientRow[] = (companies.data ?? []).map((c) => {
    const sub = subByCompany.get(c.id);
    const ci = I.filter((i) => i.company_id === c.id).sort((a, b) => a.number - b.number);
    const paid = ci.filter((i) => i.status === "paid").length;
    const open = ci.filter((i) => i.status !== "paid");
    const overdue = ci.filter((i) => i.status === "failed" || i.status === "overdue");
    const cur = (sub?.currency ?? c.currency) as Currency;
    const mrr = (open[0] ?? ci.at(-1))?.amount_net ?? 0;
    const site = siteByCompany.get(c.id);
    const ownerDone = paid >= 12 || Boolean(ownByCompany.get(c.id)?.transferred_at);
    const status: ClientRow["status"] =
      sub?.status === "canceled" ? "Anulat" : overdue.length ? "Restant" : site && ["onboarding", "building"].includes(site.status) ? "Lansare" : ownerDone ? "Proprietar" : "Activ";
    const live = sub && ["active", "past_due"].includes(sub.status);
    return {
      id: c.id, name: c.name, cui: c.cui, domain: site?.domain ?? "—", plan: (sub?.plan ?? "essential") as PlanCode, planName: PLANS[(sub?.plan ?? "essential") as PlanCode].name,
      currency: cur, mrr: live ? mrr : 0, mrrEur: live ? toEur(mrr, cur) : 0, paid, ownerDone, mode: sub?.payment_mode ?? "card",
      nextDue: open[0]?.due_date ?? null, status, isDemo: c.is_demo, startedAt: sub?.started_at ?? null, canceledAt: sub?.canceled_at ?? null,
      overdueAmount: overdue.reduce((a, i) => a + toEur(i.amount_net * (1 + i.vat_rate / 100), cur), 0),
    };
  });

  const now = new Date();
  const thisMonth = monthKey(now);
  const active = clients.filter((c) => c.mrrEur > 0);
  const mrr = active.reduce((a, c) => a + c.mrrEur, 0);
  const canceled30 = clients.filter((c) => c.canceledAt && +now - +new Date(c.canceledAt) < 30 * 864e5).length;
  const churn = active.length + canceled30 ? canceled30 / (active.length + canceled30) : 0;
  const newThisMonth = clients.filter((c) => c.startedAt && monthKey(c.startedAt) === thisMonth).length;

  // Scheduled recurring revenue per month (EUR, without VAT), last 12 months.
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
    return monthKey(d);
  });
  const curOf = new Map(clients.map((c) => [c.id, c.currency]));
  const mrrSeries = months.map((m) => ({
    month: m,
    value: Math.round(I.filter((i) => monthKey(i.due_date) === m).reduce((a, i) => a + toEur(i.amount_net, (curOf.get(i.company_id) ?? "RON") as Currency), 0)),
  }));
  const prevMrr = mrrSeries.at(-2)?.value ?? 0;

  const mix = (["essential", "growth", "partner"] as PlanCode[]).map((p) => {
    const list = active.filter((c) => c.plan === p);
    return { plan: p, name: PLANS[p].name, count: list.length, mrr: list.reduce((a, c) => a + c.mrrEur, 0) };
  });

  const inMonth = (d: string | null) => Boolean(d && monthKey(d) === thisMonth);
  const collected = I.filter((i) => i.status === "paid" && inMonth(i.paid_at));
  const scheduled = I.filter((i) => inMonth(i.due_date));
  const modeOf = new Map(clients.map((c) => [c.id, c.mode]));
  const eurGross = (i: (typeof I)[number]) => toEur(i.amount_net * (1 + i.vat_rate / 100), (curOf.get(i.company_id) ?? "RON") as Currency);
  const collectedEur = collected.reduce((a, i) => a + eurGross(i), 0);
  const cardEur = collected.filter((i) => modeOf.get(i.company_id) === "card").reduce((a, i) => a + eurGross(i), 0);
  const stripeFees = collected.filter((i) => modeOf.get(i.company_id) === "card").reduce((a, i) => a + eurGross(i) * 0.015 + 1 / EUR_RON, 0);

  const monthBucket = `${thisMonth}-01`;
  const reqs = requests.data ?? [];
  const usedImpr = reqs.filter((r) => r.type === "improvement" && r.month_bucket === monthBucket && r.status !== "rejected").length;
  const capacity = active.reduce((a, c) => a + PLANS[c.plan].improvements, 0);
  const delivered = reqs.filter((r) => r.status === "delivered" || r.status === "resolved");

  const lp = (launches.data ?? []).filter((l) => l.stage !== "live").sort((a, b) => b.day_counter - a.day_counter);
  const unmatched = (transfers.data ?? []).filter((t) => t.match_status === "unmatched");
  const restants = clients.filter((c) => c.status === "Restant");

  const twelfth = I.filter((i) => i.number === 12 && i.status !== "paid");
  const transfersByMonth = new Map<string, number>();
  for (const i of twelfth) transfersByMonth.set(monthKey(i.due_date), (transfersByMonth.get(monthKey(i.due_date)) ?? 0) + 1);
  const owners = clients.filter((c) => c.ownerDone);
  const continuation = owners.length ? owners.filter((c) => c.status !== "Anulat").length / owners.length : null;

  // Open installments for reconciliation dropdowns.
  const nameOf = new Map(clients.map((c) => [c.id, c.name]));
  const openInstallments = I.filter((i) => i.status !== "paid")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .map((i) => ({ id: i.id, label: `${nameOf.get(i.company_id)} · rata ${i.number} · ${(i.amount_net * (1 + i.vat_rate / 100)).toFixed(2)} ${curOf.get(i.company_id) === "EUR" ? "€" : "lei"}` }));

  return {
    s, clients, active, mrr, prevMrr, arr: mrr * 12, churn, canceled30, newThisMonth, mrrSeries, mix,
    arpu: active.length ? mrr / active.length : 0,
    collectedEur, scheduledEur: scheduled.reduce((a, i) => a + eurGross(i), 0), cardShare: collectedEur ? cardEur / collectedEur : 0, stripeFees,
    overdueEur: restants.reduce((a, c) => a + c.overdueAmount, 0), restants, unmatched, transfers: transfers.data ?? [],
    launches: lp, requests: reqs, usedImpr, capacity, delivered,
    transfersByMonth: [...transfersByMonth.entries()].sort().slice(0, 3), continuation, openInstallments,
    hasDemo: clients.some((c) => c.isDemo),
  };
});
