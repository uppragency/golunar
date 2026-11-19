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
    db.from("companies").select("id, name, cui, is_demo, currency, bank_reference, legal_rep, phone, billing_email, notify_email, referred_by, created_at, tags"),
    db.from("briefs").select("company_id, submitted_at"),
    db.from("leads").select("*").order("created_at", { ascending: false }).limit(500),
    db.from("discount_codes").select("*"),
    db.from("email_log").select("company_id, template, sent_at, status").in("status", ["sent"]).order("sent_at", { ascending: false }).limit(2000),
    db.from("subscriptions").select("id, company_id, plan, status, payment_mode, currency, created_at, started_at, canceled_at, cancel_at, cancel_reason, cancel_category, retention_accepted_at, discount_code_id"),
    db.from("installments").select("id, company_id, subscription_id, number, due_date, amount_net, amount_plan, amount_addons, amount_discount, currency, status, paid_at, payment_notified_at"),
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
        paused: l.sla_paused as boolean, checklist: ((l.checklist as Record<string, boolean>) ?? {}), designUrl: l.design_url as string | null, designStatus: l.design_status as string | null, designFeedback: l.design_feedback as string | null, designSentAt: l.design_sent_at as string | null, reason: l.paused_reason as string | null, freeMonth: l.free_month_applied_at as string | null,
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

  // ---------- Lot 2 ----------
  const [sitesQ, refsQ, upQ] = await Promise.all([
    db.from("websites").select("id, company_id, domain, status, domain_expires_at, uptime_90d, psi_mobile, psi_desktop, ssl_expires_at, http_status, broken_links, tech_checked_at, last_backup_at"),
    db.from("referrals").select("referrer_company_id, referred_company_id, status, created_at"),
    db.from("uptime_checks").select("website_id, ok, checked_at").order("checked_at", { ascending: false }).limit(400),
  ]);
  const lastCheck = new Map<string, { ok: boolean; checked_at: string }>();
  for (const u of upQ.data ?? []) if (!lastCheck.has(u.website_id)) lastCheck.set(u.website_id, u);
  const sites = (sitesQ.data ?? []).filter((w) => !C.get(w.company_id)?.is_demo).map((w) => {
    const days = (x: string | null) => (x ? Math.ceil((+new Date(x) - Date.now()) / 864e5) : null);
    const issues: string[] = [];
    const lc = lastCheck.get(w.id);
    if (lc && !lc.ok) issues.push("site căzut");
    if (w.http_status && w.http_status >= 400) issues.push(`HTTP ${w.http_status}`);
    const ssl = days(w.ssl_expires_at), dom = days(w.domain_expires_at);
    if (ssl != null && ssl <= 14) issues.push(`SSL expiră în ${ssl} z`);
    if (dom != null && dom <= 30) issues.push(`domeniul expiră în ${dom} z`);
    if (w.psi_mobile != null && w.psi_mobile < 90) issues.push(`viteză mobil ${w.psi_mobile}`);
    const broken = (w.broken_links as { url: string; status: number }[] | null) ?? [];
    if (broken.length) issues.push(`${broken.length} linkuri rupte`);
    return { ...w, name: C.get(w.company_id)?.name ?? "—", down: Boolean(lc && !lc.ok), lastCheckAt: lc?.checked_at ?? null, sslDays: ssl, domainDays: dom, broken, issues };
  });

  // rate restante (lunare)
  const overdue = I.filter((i) => (i.status === "overdue" || i.status === "failed") && !C.get(i.company_id)?.is_demo).map((i) => ({
    id: i.id, companyId: i.company_id, name: C.get(i.company_id)?.name ?? "—", number: i.number, due: i.due_date as string, amount: i.amount_net, currency: i.currency as Currency,
    late: daysSince(i.due_date), reminders: mails.filter((m) => m.company_id === i.company_id && m.template.startsWith("overdue_")).length,
    phone: C.get(i.company_id)?.phone ?? null,
  })).sort((a, b) => b.late - a.late);

  // proprietate aproape completă: 10 sau 11 rate plătite
  const nearOwnership = d.clients.filter((c) => (c.paid === 10 || c.paid === 11) && c.status !== "Anulat").map((c) => ({ ...c, left: 12 - c.paid }));

  // valoarea recomandărilor
  const paidBy = new Map<string, number>();
  for (const i of I) if (i.status === "paid") paidBy.set(i.company_id, (paidBy.get(i.company_id) ?? 0) + i.amount_net * (i.currency === "EUR" ? 5.09 : 1));
  const refAgg = new Map<string, { count: number; revenue: number; names: string[] }>();
  for (const r of refsQ.data ?? []) {
    if (!r.referred_company_id || r.status === "rejected") continue;
    const v = refAgg.get(r.referrer_company_id) ?? { count: 0, revenue: 0, names: [] };
    v.count++;
    v.revenue += paidBy.get(r.referred_company_id) ?? 0;
    v.names.push(C.get(r.referred_company_id)?.name ?? "—");
    refAgg.set(r.referrer_company_id, v);
  }
  const referralValue = [...refAgg.entries()].map(([id, v]) => ({ id, name: C.get(id)?.name ?? "—", ...v })).sort((a, b) => b.revenue - a.revenue);

  // upgrade sugerat: peste îmbunătățirile incluse luna aceasta sau în 2 din ultimele 3 luni
  const monthsBack = [0, 1, 2].map((k) => { const x = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - k, 1)); return x.toISOString().slice(0, 10); });
  const nextPlan: Record<PlanCode, PlanCode | null> = { essential: "growth", growth: "partner", partner: null };
  const upgrades = d.clients.filter((c) => c.mrrEur > 0 && nextPlan[c.plan]).map((c) => {
    const per = monthsBack.map((m) => d.requests.filter((r) => r.company_id === c.id && r.type === "improvement" && r.month_bucket === m && r.status !== "rejected").length);
    const incl = PLANS[c.plan].improvements;
    const over = per.filter((n) => n > incl).length;
    return { ...c, per, incl, over, to: nextPlan[c.plan]!, offered: mails.some((m) => m.company_id === c.id && m.template === "upgrade_offer") };
  }).filter((c) => c.per[0] > c.incl || c.over >= 2);

  // prognoză încasări din ratele programate ale abonamentelor active (lei, convertit din euro)
  const activeSubs = new Set((subs.data ?? []).filter((x) => ["active", "past_due"].includes(x.status) && !C.get(x.company_id)?.is_demo && !x.cancel_at).map((x) => x.id));
  const inDays = (dd: string) => (+new Date(dd) - +today) / 864e5;
  const lei = (i: (typeof I)[number]) => i.amount_net * (i.currency === "EUR" ? 5.09 : 1);
  const open = I.filter((i) => i.status !== "paid" && activeSubs.has(i.subscription_id));
  const forecast = [30, 60, 90].map((n) => ({ days: n, amount: open.filter((i) => inDays(i.due_date) >= -0.5 && inDays(i.due_date) <= n).reduce((a, i) => a + lei(i), 0) }));
  const overdueLei = open.filter((i) => inDays(i.due_date) < -0.5).reduce((a, i) => a + lei(i), 0);
  const cancelReasons = new Map<string, number>();
  for (const x of subs.data ?? []) if ((x.cancel_at || x.status === "canceled") && x.cancel_category) cancelReasons.set(x.cancel_category, (cancelReasons.get(x.cancel_category) ?? 0) + 1);
  const retained = (subs.data ?? []).filter((x) => x.retention_accepted_at).length;

  // ---------- Lot 4 ----------
  const [loginsQ, transfersAll, ownQ] = await Promise.all([
    db.rpc("admin_member_logins"),
    db.from("bank_transfers").select("id, received_at, payer_name, reference, amount, currency, matched_installment_id, match_status, confirmed_at").order("received_at", { ascending: false }).limit(500),
    db.from("ownership").select("company_id, transferred_at, handover_sent_at"),
  ]);
  const lastLogin = new Map(((loginsQ.data ?? []) as { company_id: string; last_sign_in: string | null }[]).map((x) => [x.company_id, x.last_sign_in]));
  const ownMap = new Map((ownQ.data ?? []).map((o) => [o.company_id, o]));

  // scor de sănătate 0–100
  const health = new Map<string, { score: number; reasons: string[] }>();
  for (const c of d.clients.filter((x) => !x.isDemo || true)) {
    if (c.status === "Anulat") continue;
    const reasons: string[] = [];
    let sc = 100;
    const od = overdue.filter((o) => o.companyId === c.id);
    if (od.length) { const late = Math.max(...od.map((o) => o.late)); sc -= late >= 10 ? 40 : 25; reasons.push(`rată restantă de ${late} zile`); }
    const sub = (subs.data ?? []).find((x) => x.company_id === c.id && x.cancel_at);
    if (sub) { sc -= 45; reasons.push("a cerut anularea"); }
    const ll = lastLogin.get(c.id);
    const loginDays = ll ? daysSince(ll) : null;
    if (loginDays == null || loginDays > 45) { sc -= 15; reasons.push(loginDays == null ? "nu a intrat în portal" : `ultima intrare în portal acum ${loginDays} zile`); }
    const lastReq = d.requests.filter((r) => r.company_id === c.id).map((r) => r.created_at).sort().at(-1);
    if (c.paid >= 2 && (!lastReq || daysSince(lastReq) > 60)) { sc -= 10; reasons.push("nicio cerere în 60 de zile"); }
    const site = sites.find((w) => w.company_id === c.id);
    if (site?.down) { sc -= 20; reasons.push("site căzut"); }
    else if (site?.uptime_90d != null && +site.uptime_90d < 99) { sc -= 10; reasons.push(`uptime ${(+site.uptime_90d).toFixed(1)}%`); }
    const prod = production.find((p) => p.companyId === c.id);
    if (prod && !prod.brief && prod.briefHours > 96) { sc -= 15; reasons.push("brief lipsă de peste 4 zile"); }
    if (prod?.tone === "bad") { sc -= 10; reasons.push("lansare întârziată"); }
    health.set(c.id, { score: Math.max(0, sc), reasons });
  }
  const atRisk = d.clients.filter((c) => !c.isDemo && (health.get(c.id)?.score ?? 100) < 60).map((c) => ({ ...c, health: health.get(c.id)! })).sort((a, b) => a.health.score - b.health.score);

  // aniversări: 6 și 12 luni (fereastră de 7 zile)
  const anniversaries = d.clients.filter((c) => !c.isDemo && c.status !== "Anulat" && c.startedAt).flatMap((c) => {
    const start = new Date(c.startedAt!);
    return [6, 12].map((m) => {
      const at = new Date(start); at.setMonth(at.getMonth() + m);
      const delta = Math.round((+at - +today) / 864e5);
      const sent = mails.some((x) => x.company_id === c.id && x.template === `anniversary_${m}`);
      return { id: c.id, name: c.name, months: m, at: at.toISOString().slice(0, 10), delta, sent };
    }).filter((a) => a.delta >= -7 && a.delta <= 7 && !a.sent);
  });

  // dubluri: același email, telefon sau nume normalizat între firme
  const norm = (x: string | null | undefined) => (x ?? "").toLowerCase().replace(/\b(s\.?r\.?l\.?|s\.?a\.?|pfa|ii|if)\b/g, "").replace(/[^\p{L}\p{N}]/gu, "");
  const phoneN = (x: string | null | undefined) => (x ?? "").replace(/\D/g, "").slice(-9);
  const cos = [...C.values()].filter((c) => !c.is_demo);
  const duplicates: { a: { id: string; name: string }; b: { id: string; name: string }; why: string }[] = [];
  for (let i = 0; i < cos.length; i++) for (let j = i + 1; j < cos.length; j++) {
    const a = cos[i], b = cos[j];
    const why: string[] = [];
    const ea = (a.notify_email || a.billing_email || "").toLowerCase(), eb = (b.notify_email || b.billing_email || "").toLowerCase();
    if (ea && ea === eb) why.push("același email");
    if (phoneN(a.phone).length === 9 && phoneN(a.phone) === phoneN(b.phone)) why.push("același telefon");
    if (norm(a.name).length > 3 && norm(a.name) === norm(b.name)) why.push("același nume");
    if (why.length) duplicates.push({ a: { id: a.id, name: a.name }, b: { id: b.id, name: b.name }, why: why.join(", ") });
  }

  // plăți duble: transferuri identice sau mai multe transferuri potrivite pe aceeași rată
  const tx = transfersAll.data ?? [];
  const doublePayments: { key: string; label: string; detail: string }[] = [];
  const byInst = new Map<string, typeof tx>();
  for (const t of tx) if (t.matched_installment_id) byInst.set(t.matched_installment_id, [...(byInst.get(t.matched_installment_id) ?? []), t]);
  for (const [iid, list] of byInst) if (list.length > 1) {
    const inst = I.find((i) => i.id === iid);
    doublePayments.push({ key: `i${iid}`, label: `${C.get(inst?.company_id ?? "")?.name ?? "—"} · rata ${inst?.number ?? "?"}`, detail: `${list.length} transferuri potrivite pe aceeași rată` });
  }
  const seen = new Map<string, (typeof tx)[number]>();
  for (const t of tx) {
    const k = `${(t.payer_name ?? "").toLowerCase()}|${t.amount}|${t.currency}`;
    const prev = seen.get(k);
    if (prev && Math.abs(+new Date(prev.received_at) - +new Date(t.received_at)) <= 3 * 864e5) doublePayments.push({ key: `t${t.id}`, label: `${t.payer_name} · ${(+t.amount).toFixed(2)} ${t.currency === "EUR" ? "€" : "lei"}`, detail: `două transferuri identice în 3 zile (${t.received_at}, ${prev.received_at})` });
    seen.set(k, t);
  }

  // preț vechi: rata următoare are alt preț de plan decât lista actuală
  const oldPrice = d.clients.filter((c) => !c.isDemo && c.mrrEur > 0).map((c) => {
    const nxt = I.filter((i) => i.company_id === c.id && i.status !== "paid" && i.number > 1).sort((a, b) => a.number - b.number)[0];
    const planPrice = nxt ? Number(nxt.amount_plan) : null;
    const list = c.currency === "EUR" ? PLANS[c.plan].eur : PLANS[c.plan].ron;
    return { ...c, planPrice, listPrice: list };
  }).filter((c) => c.planPrice != null && Math.abs(c.planPrice - c.listPrice) > 0.5);

  // predare la proprietate: 12 rate plătite, transfer neefectuat
  const handover = d.clients.filter((c) => c.paid >= 12 && !ownMap.get(c.id)?.transferred_at && !c.isDemo);

  // plăți anunțate de client („Am plătit”)
  const notified = I.filter((i) => i.status !== "paid" && (i as { payment_notified_at?: string | null }).payment_notified_at).map((i) => ({ id: i.id, companyId: i.company_id, name: C.get(i.company_id)?.name ?? "—", number: i.number, amount: i.amount_net, currency: i.currency as Currency }));

  const newRequests = d.requests.filter((r) => r.status === "new");
  const freshBriefs = production.filter((p) => p.brief && hoursSince(p.brief) <= 72 && p.stage === "design");

  return {
    ...d, health, atRisk, anniversaries, duplicates, doublePayments, oldPrice, handover, notified, lastLogin, forecast, overdueLei, cancelReasons: [...cancelReasons.entries()].sort((a, b) => b[1] - a[1]), retained, sites, overdue, nearOwnership, referralValue, upgrades, newRequests, freshBriefs, orders, expired, production, missingBrief, improvements, codeStats, golunar, leads: L,
    sources: [...bySource.entries()].map(([k, v]) => ({ source: k, ...v })).sort((a, b) => b.leads - a.leads),
    company: C, mails, installmentsAll: I, subsAll: subs.data ?? [],
  };
});
