import "server-only";
import { cache } from "react";
import { getAdminData } from "@/lib/admin-data";
import { PLANS, type Currency, type PlanCode } from "@/lib/plans";

/** Zile lucrătoare (luni–vineri) între două date, exclusiv `from`, inclusiv `to`. Negativ dacă `to` < `from`. */
export function businessDays(from: Date, to: Date) {
  const a = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()));
  const b = new Date(Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()));
  const sign = b >= a ? 1 : -1;
  const [lo, hi] = sign > 0 ? [a, b] : [b, a];
  let n = 0;
  for (const d = new Date(lo); d < hi; ) {
    d.setUTCDate(d.getUTCDate() + 1);
    const w = d.getUTCDay();
    if (w !== 0 && w !== 6) n++;
  }
  return n * sign;
}

const daysSince = (d: string | null | undefined) => (d ? Math.floor((Date.now() - +new Date(d)) / 864e5) : 0);
const hoursSince = (d: string | null | undefined) => (d ? (Date.now() - +new Date(d)) / 36e5 : 0);

export type Stage = "brief" | "design" | "build" | "qa" | "live";
export const STAGES: { key: Stage; label: string }[] = [
  { key: "brief", label: "Așteaptă brief" },
  { key: "design", label: "Design" },
  { key: "build", label: "Dezvoltare" },
  { key: "qa", label: "Testare" },
  { key: "live", label: "Lansat" },
];

export const LEAD_STATUS: Record<string, [string, "acc" | "warn" | "ok" | "bad"]> = {
  new: ["Nou", "acc"], contacted: ["Contactat", "warn"], won: ["Câștigat", "ok"], lost: ["Pierdut", "bad"],
};
export const SOURCE_LABEL: Record<string, string> = { "discutie-gratuita": "Discuție gratuită", audit: "Audit gratuit", checkout: "Comandă", site: "Site" };

export const getOps = cache(async () => {
  const d = await getAdminData();
  const db = d.s.supabase;
  const [companies, briefs, leads, codes, emails, subs, inst] = await Promise.all([
    db.from("companies").select("id, name, cui, is_demo, currency, bank_reference, legal_rep, phone, billing_email, notify_email, referred_by, created_at"),
    db.from("briefs").select("company_id, submitted_at"),
    db.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
    db.from("discount_codes").select("*"),
    db.from("email_log").select("company_id, template, sent_at, status").in("status", ["sent"]).order("sent_at", { ascending: false }).limit(2000),
    db.from("subscriptions").select("id, company_id, plan, status, payment_mode, currency, created_at, started_at, canceled_at, cancel_reason, discount_code_id"),
    db.from("installments").select("id, company_id, subscription_id, number, due_date, amount_net, amount_plan, amount_addons, amount_discount, currency, status, paid_at"),
  ]);
  const C = new Map((companies.data ?? []).map((c) => [c.id, c]));
  const briefAt = new Map((briefs.data ?? []).map((b) => [b.company_id, b.submitted_at as string | null]));
  const mails = emails.data ?? [];
  const sentTo = (company: string, tpl: string) => mails.filter((m) => m.company_id === company && m.template === tpl);
  const I = (inst.data ?? []).map((i) => ({ ...i, amount_net: +i.amount_net }));
  const today = new Date();

  // ---------- comenzi neplătite ----------
  const orders = (subs.data ?? [])
    .filter((s) => s.status === "incomplete" && !C.get(s.company_id)?.is_demo)
    .map((s) => {
      const c = C.get(s.company_id)!;
      const first = I.find((i) => i.subscription_id === s.id && i.number === 1);
      const age = daysSince(s.created_at);
      return {
        subId: s.id, companyId: s.company_id, name: c?.name ?? "—", cui: c?.cui ?? "", reference: c?.bank_reference ?? "", plan: s.plan as PlanCode,
        email: (c?.notify_email || c?.billing_email || "") as string, phone: c?.phone ?? "", rep: c?.legal_rep ?? "",
        amount: first?.amount_net ?? 0, currency: (s.currency ?? "RON") as Currency, installmentId: first?.id ?? null, paid: first?.status === "paid",
        createdAt: s.created_at as string, age, expiresIn: Math.max(0, 10 - age),
        reminders: ["order_reminder_1", "order_reminder_2", "order_reminder_manual"].reduce((a, t) => a + sentTo(s.company_id, t).length, 0),
      };
    })
    .filter((o) => !o.paid)
    .sort((a, b) => b.age - a.age);
  const expired = (subs.data ?? []).filter((s) => s.status === "canceled" && s.cancel_reason === "Comandă neplătită în 10 zile" && daysSince(s.canceled_at) <= 30).length;

  // ---------- producție ----------
  const firstPaid = new Map(I.filter((i) => i.number === 1 && i.status === "paid").map((i) => [i.company_id, i.paid_at as string | null]));
  const { data: lps } = await db.from("launch_projects").select("*, websites(domain), companies(name)");
  const production = (lps ?? [])
    .filter((l) => l.stage !== "live" || daysSince(l.completed_at) <= 30)
    .map((l) => {
      const brief = briefAt.get(l.company_id) ?? l.brief_at ?? null;
      const due = l.due_at ? new Date(l.due_at) : null;
      const left = due ? businessDays(today, due) : null;
      const used = l.started_at ? Math.max(0, businessDays(new Date(l.started_at), today)) : 0;
      const tone: "ok" | "warn" | "bad" | "" = l.stage === "live" ? "ok" : !due ? "" : left! < 0 ? "bad" : left! <= 3 ? "warn" : "ok";
      return {
        id: l.id as string, companyId: l.company_id as string, name: (l.companies as { name: string } | null)?.name ?? "—", domain: (l.websites as { domain: string } | null)?.domain ?? "—",
        stage: (l.stage === "brief" && brief ? "design" : l.stage) as Stage, brief, due: l.due_at as string | null, left, used, tone,
        paused: l.sla_paused as boolean, reason: l.paused_reason as string | null, freeMonth: l.free_month_applied_at as string | null,
        stageSince: daysSince(l.stage_changed_at), paidAt: firstPaid.get(l.company_id) ?? null,
        briefHours: brief ? 0 : hoursSince(firstPaid.get(l.company_id)),
        briefReminders: sentTo(l.company_id, "brief_reminder_1").length + sentTo(l.company_id, "brief_reminder_2").length + sentTo(l.company_id, "brief_reminder_manual").length,
      };
    });
  const missingBrief = production.filter((p) => !p.brief && p.stage === "brief");

  // ---------- îmbunătățiri per client (luna curentă) ----------
  const bucket = `${today.toISOString().slice(0, 7)}-01`;
  const improvements = new Map<string, { used: number; included: number }>();
  for (const c of d.clients) {
    const used = d.requests.filter((r) => r.company_id === c.id && r.type === "improvement" && r.month_bucket === bucket && r.status !== "rejected").length;
    improvements.set(c.id, { used, included: c.mrrEur > 0 ? PLANS[c.plan].improvements : 0 });
  }

  // ---------- cohortă pe cod de reducere: câți plătesc luna 2, 3, 4 ----------
  const codeStats = (codes.data ?? []).map((code) => {
    const cs = (subs.data ?? []).filter((s) => s.discount_code_id === code.id && !C.get(s.company_id)?.is_demo);
    const paid = (n: number) => cs.filter((s) => I.some((i) => i.subscription_id === s.id && i.number === n && i.status === "paid")).length;
    const due = (n: number) => cs.filter((s) => I.some((i) => i.subscription_id === s.id && i.number === n && new Date(i.due_date) <= today)).length;
    const revenue = I.filter((i) => cs.some((s) => s.id === i.subscription_id) && i.status === "paid").reduce((a, i) => a + i.amount_net * (i.currency === "EUR" ? 5.09 : 1), 0);
    const steps = [1, 2, 3, 4, 6, 12].map((n) => ({ n, due: n === 1 ? cs.length : due(n), paid: paid(n) }));
    return {
      id: code.id as string, code: code.code as string, active: code.active as boolean, orders: cs.length, converted: paid(1),
      stayed: cs.filter((s) => s.status === "active" || s.status === "past_due").length, canceled: cs.filter((s) => s.status === "canceled").length, revenue, steps,
    };
  });
  const golunar = codeStats.find((c) => c.code === "GOLUNAR") ?? null;

  // ---------- lead-uri ----------
  const L = (leads.data ?? []).map((l) => {
    const src = (l.meta as { src?: { s?: string; m?: string; c?: string; l?: string } } | null)?.src ?? null;
    return {
      id: l.id as string, name: l.name as string, email: l.email as string, phone: l.phone as string | null, company: l.company as string | null,
      message: l.message as string | null, plan: l.plan as PlanCode | null, source: (l.source as string) || "site", ref: l.referral_code as string | null,
      channel: src?.s || (l.referral_code ? "recomandare" : "necunoscut"), medium: src?.m || "", campaign: src?.c || "", landing: src?.l || "",
      status: (l.status as string) || "new", note: l.note as string | null, createdAt: l.created_at as string,
      url: (l.meta as { url?: string } | null)?.url ?? null,
    };
  });
  const bySource = new Map<string, { leads: number; won: number }>();
  for (const l of L) {
    const k = l.channel;
    const v = bySource.get(k) ?? { leads: 0, won: 0 };
    v.leads++;
    if (l.status === "won" || l.source === "checkout") v.won++;
    bySource.set(k, v);
  }

  return {
    ...d, orders, expired, production, missingBrief, improvements, codeStats, golunar, leads: L,
    sources: [...bySource.entries()].map(([k, v]) => ({ source: k, ...v })).sort((a, b) => b.leads - a.leads),
    company: C, mails, installmentsAll: I, subsAll: subs.data ?? [],
  };
});
