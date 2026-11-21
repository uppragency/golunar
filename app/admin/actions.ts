"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, VIEW_AS_COOKIE } from "@/lib/session";
import { provision, startLaunch } from "@/lib/provision";
import { createSmartbillInvoice } from "@/lib/smartbill";
import { syncContact } from "@/lib/contacts";
import { sendEmail, templates } from "@/lib/email";
import { money } from "@/lib/format";
import type { Currency } from "@/lib/plans";
import { PAYEE } from "@/lib/bank";
import { CHECKLIST } from "@/lib/checklist";
import { SITE_URL } from "@/lib/env";
import { checkSite } from "@/lib/tech-check";
import { PLANS as PLAN_DEFS, type PlanCode as PlanKey } from "@/lib/plans";

export type ActionState = { ok?: string; error?: string } | null;

export async function setViewAs(form: FormData) {
  await requireAdmin();
  const id = String(form.get("company_id") || "");
  const store = await cookies();
  store.set(VIEW_AS_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 8 });
  redirect("/cont");
}

export async function clearViewAs() {
  const store = await cookies();
  store.delete(VIEW_AS_COOKIE);
  redirect("/admin/clienti");
}

const NewClient = z.object({
  cui: z.string().trim().min(2).max(14),
  name: z.string().trim().min(2).max(200),
  reg_com: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  contact: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().max(40).optional().default(""),
  domain: z.string().trim().max(120).optional().default(""),
  plan: z.enum(["essential", "growth", "partner"]),
  currency: z.enum(["RON", "EUR"]),
  mode: z.enum(["card", "bank_transfer"]),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  brand: z.string().optional(),
  local: z.string().optional(),
  ai: z.string().optional(),
  langs: z.coerce.number().int().min(0).max(5).default(0),
  first_paid: z.string().optional(),
  send_welcome: z.string().optional(),
});

export async function createClientAction(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  const p = NewClient.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: `Verifică câmpurile: ${p.error.issues.map((i) => i.path.join(".")).join(", ")}` };
  const d = p.data;
  let companyId: string;
  try {
    const res = await provision(s.supabase, {
      company: { cui: d.cui, name: d.name, regCom: d.reg_com, address: d.address, vatPayer: /^ro/i.test(d.cui), contact: d.contact, email: d.email, phone: d.phone },
      domain: d.domain,
      cart: { plan: d.plan, brand: Boolean(d.brand), local: Boolean(d.local), ai: Boolean(d.ai), langs: d.langs },
      currency: d.currency,
      mode: d.mode,
      start: new Date(`${d.start}T00:00:00Z`),
      firstPaid: Boolean(d.first_paid),
    });
    companyId = res.companyId;
    await syncContact({ email: d.email, name: d.contact, kind: "client", tags: ["client-adaugat-manual"] });
    if (d.send_welcome) await sendEmail({ db: s.supabase, companyId, template: "welcome", to: d.email, subject: "Bun venit la LUNAR · contul tău e gata", html: templates.welcome(d.contact) });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Clientul nu a putut fi creat." };
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/clienti/${companyId}`);
}

export async function updateRequest(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  const hours = form.get("hours_spent") ? Number(form.get("hours_spent")) : null;
  await s.supabase.from("requests").update({ status, hours_spent: hours, delivered_at: status === "delivered" || status === "resolved" ? new Date().toISOString().slice(0, 10) : null }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function updateLaunch(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  const stage = String(form.get("stage"));
  const day = Math.max(0, Math.min(30, Number(form.get("day_counter") || 1)));
  const paused = form.get("sla_paused") === "on";
  const reason = String(form.get("paused_reason") || "").slice(0, 200) || null;
  const { data: lp } = await s.supabase.from("launch_projects").update({ stage, day_counter: day, sla_paused: paused, paused_reason: paused ? reason : null, completed_at: stage === "live" ? new Date().toISOString().slice(0, 10) : null }).eq("id", id).select("website_id").single();
  if (lp && stage === "live") await s.supabase.from("websites").update({ status: "live", launched_at: new Date().toISOString().slice(0, 10) }).eq("id", lp.website_id);
  revalidatePath("/admin", "layout");
}

export async function updateWebsite(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  const str = (k: string) => (String(form.get(k) ?? "").trim() || null);
  await s.supabase.from("websites").update({
    domain: str("domain"), registrar: str("registrar"), domain_expires_at: str("domain_expires_at"), status: str("status"),
    email_provider: str("email_provider"), ga4_id: str("ga4_id"), vercel_project_id: str("vercel_project_id"),
    preview_title: str("preview_title"), preview_subtitle: str("preview_subtitle"),
    dns_auth_ok: form.get("dns_auth_ok") === "on", search_console: form.get("search_console") === "on", business_profile: form.get("business_profile") === "on",
    show_on_status: form.get("show_on_status") === "on",
  }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function startLaunchAction(form: FormData) {
  const s = await requireAdmin();
  await startLaunch(s.supabase, String(form.get("website_id")), String(form.get("company_id")));
  revalidatePath("/admin", "layout");
}

async function markPaid(db: Awaited<ReturnType<typeof requireAdmin>>["supabase"], installmentId: string, method: string) {
  const { data: inst } = await db.from("installments").select("*, companies(*)").eq("id", installmentId).single();
  if (!inst || inst.status === "paid") return;
  await db.from("installments").update({ status: "paid", paid_at: new Date().toISOString(), method }).eq("id", installmentId);
  await db.from("subscriptions").update({ status: "active" }).eq("id", inst.subscription_id).in("status", ["incomplete", "past_due"]);
  await db.from("payment_attempts").insert({ company_id: inst.company_id, installment_id: installmentId, method_label: method, succeeded: true });
  const c = inst.companies;
  const gross = Math.round(Number(inst.amount_net) * (1 + Number(inst.vat_rate) / 100) * 100) / 100;
  let series = "LNR", number = `M-${Date.now().toString(36).toUpperCase()}`, spv = "pending";
  try {
    const sb = await createSmartbillInvoice({
      client: { name: c.name, vatCode: c.cui, regCom: c.reg_com, address: c.address, email: c.billing_email, isTaxPayer: c.vat_payer },
      currency: inst.currency, issueDate: new Date().toISOString().slice(0, 10), paid: true, paymentType: "Ordin plata",
      lines: [{ name: `Abonament LUNAR · rata ${inst.number}/12`, quantity: 1, price: Number(inst.amount_net) }],
    });
    if (sb) { series = sb.series; number = sb.number; spv = "sent"; }
  } catch (e) {
    console.error("[smartbill]", e);
    spv = "error";
  }
  await db.from("invoices").insert({ company_id: inst.company_id, installment_id: installmentId, smartbill_series: series, smartbill_number: number, issued_at: new Date().toISOString().slice(0, 10),
    period_label: new Date(inst.due_date).toLocaleDateString("ro-RO", { month: "long", year: "numeric" }), total: gross, currency: inst.currency, payment_label: method, spv_status: spv });
  if (inst.number === 1) {
    await rewardReferrer(db, inst.company_id);
    const { data: site } = await db.from("websites").select("id").eq("company_id", inst.company_id).limit(1).maybeSingle();
    if (site) await startLaunch(db, site.id, inst.company_id);
  }
  if (c.billing_email) await sendEmail({ db, companyId: inst.company_id, billing: true, template: `installment_paid_${inst.number}`, to: c.billing_email, subject: `Rata ${inst.number} din 12 încasată · LUNAR`, html: templates.paymentOk(money(gross, inst.currency as Currency, 2), inst.number) });
}

export async function markInstallmentPaid(form: FormData) {
  const s = await requireAdmin();
  await markPaid(s.supabase, String(form.get("id")), String(form.get("method") || "Transfer"));
  revalidatePath("/admin", "layout");
}

export async function confirmTransfer(form: FormData) {
  const s = await requireAdmin();
  const transferId = String(form.get("transfer_id"));
  const installmentId = String(form.get("installment_id") || "");
  if (!installmentId) return;
  await markPaid(s.supabase, installmentId, "Transfer");
  await s.supabase.from("bank_transfers").update({ matched_installment_id: installmentId, match_status: "manual", confirmed_at: new Date().toISOString() }).eq("id", transferId);
  revalidatePath("/admin", "layout");
}

/** CSV: data;plătitor;referință;sumă;monedă (separator ; sau ,). Potrivire automată pe referință + sumă. */
export async function importTransfers(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  const csv = String(form.get("csv") || "").trim();
  if (!csv) return { error: "Lipește rândurile din extras." };
  const rows = csv.split(/\r?\n/).map((l) => l.split(/[;\t]/).map((c) => c.trim())).filter((r) => r.length >= 4 && /\d/.test(r[3]));
  if (!rows.length) return { error: "Format: data;plătitor;referință;sumă;monedă" };
  let auto = 0;
  for (const [d, payer, ref, amt, curRaw] of rows) {
    const amount = Number(amt.replace(/\./g, "").replace(",", "."));
    const currency = (curRaw || "RON").toUpperCase() === "EUR" ? "EUR" : "RON";
    const received = /^\d{2}[./]\d{2}[./]\d{4}$/.test(d) ? d.slice(6, 10) + "-" + d.slice(3, 5) + "-" + d.slice(0, 2) : d;
    const refMatch = (ref || payer).match(/LNR-\d{4}/i)?.[0]?.toUpperCase();
    let match: string | null = null;
    if (refMatch) {
      const { data: c } = await s.supabase.from("companies").select("id").eq("bank_reference", refMatch).maybeSingle();
      if (c) {
        const { data: inst } = await s.supabase.from("installments").select("id, amount_net, vat_rate").eq("company_id", c.id).neq("status", "paid").order("number").limit(1);
        const i = inst?.[0];
        if (i && Math.abs(Number(i.amount_net) * (1 + Number(i.vat_rate) / 100) - amount) < 1) match = i.id;
      }
    }
    const { data: t } = await s.supabase.from("bank_transfers").insert({ received_at: received, payer_name: payer, reference: refMatch ?? (ref || null), amount, currency, match_status: match ? "auto" : "unmatched", matched_installment_id: match, raw: { line: [d, payer, ref, amt, curRaw] } }).select("id").single();
    if (match && t) {
      await markPaid(s.supabase, match, "Transfer");
      await s.supabase.from("bank_transfers").update({ confirmed_at: new Date().toISOString() }).eq("id", t.id);
      auto++;
    }
  }
  revalidatePath("/admin", "layout");
  return { ok: `${rows.length} transferuri importate · ${auto} potrivite automat · ${rows.length - auto} de reconciliat.` };
}

export async function inviteMember(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  const email = String(form.get("email") || "").trim();
  const role = String(form.get("role") || "owner");
  const company = String(form.get("company_id"));
  if (!z.email().safeParse(email).success) return { error: "Email invalid." };
  const { error } = await s.supabase.rpc("invite_member", { p_email: email, p_company: company, p_role: role });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: `Acces acordat pentru ${email}. Se autentifică din /login.` };
}

export async function saveBankSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  const value = { beneficiary: String(form.get("beneficiary") || ""), bank: String(form.get("bank") || ""), iban_ron: String(form.get("iban_ron") || ""), iban_eur: String(form.get("iban_eur") || "") };
  const { error } = await s.supabase.from("app_settings").upsert({ key: "bank", value });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: "Date bancare salvate." };
}

export async function deleteDemoData(): Promise<ActionState> {
  const s = await requireAdmin();
  const { error, count } = await s.supabase.from("companies").delete({ count: "exact" }).eq("is_demo", true);
  if (error) return { error: error.message };
  await s.supabase.from("bank_transfers").delete().is("matched_installment_id", null).in("payer_name", ["FORMA FITNESS SRL"]);
  revalidatePath("/admin", "layout");
  return { ok: `${count ?? 0} firme demo șterse.` };
}

export async function updateReferral(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!["pending", "converted", "rewarded", "rejected"].includes(status)) return;
  const month = String(form.get("reward_month") ?? "").trim();
  await s.supabase.from("referrals").update({ status, reward_month: month ? `${month.slice(0, 7)}-01` : null }).eq("id", id);
  revalidatePath("/admin", "layout");
}

const DiscountInput = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,24}$/, "Codul are 3–24 caractere: litere, cifre, - sau _."),
  description: z.string().trim().max(200).optional().default(""),
  kind: z.enum(["percent", "fixed"]),
  percent: z.coerce.number().min(0).max(100).optional(),
  amount_ron: z.coerce.number().min(0).optional(),
  amount_eur: z.coerce.number().min(0).optional(),
  months: z.coerce.number().int().min(1).max(12),
  max_redemptions: z.coerce.number().int().min(0).optional(),
  starts_at: z.string().optional().default(""),
  ends_at: z.string().optional().default(""),
});

export async function createDiscount(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  const parsed = DiscountInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  const d = parsed.data;
  if (d.kind === "percent" && !(d.percent && d.percent > 0)) return { error: "Completează procentul." };
  if (d.kind === "fixed" && !(d.amount_ron && d.amount_eur)) return { error: "Completează suma în lei și în euro." };
  const plans = form.getAll("plans").map(String).filter((p) => ["essential", "growth", "partner"].includes(p));
  const { error } = await s.supabase.from("discount_codes").insert({
    code: d.code, description: d.description || null, kind: d.kind,
    percent: d.kind === "percent" ? d.percent : null,
    amount_ron: d.kind === "fixed" ? d.amount_ron : null,
    amount_eur: d.kind === "fixed" ? d.amount_eur : null,
    months: d.months,
    plans: plans.length && plans.length < 3 ? plans : null,
    max_redemptions: d.max_redemptions || null,
    starts_at: d.starts_at ? new Date(d.starts_at).toISOString() : null,
    ends_at: d.ends_at ? new Date(`${d.ends_at}T23:59:59`).toISOString() : null,
    new_customers_only: form.get("new_customers_only") === "on",
  });
  if (error) return { error: error.code === "23505" ? "Codul există deja." : error.message };
  revalidatePath("/admin/reduceri");
  return { ok: `Codul ${d.code} este activ.` };
}

export async function toggleDiscount(form: FormData) {
  const s = await requireAdmin();
  await s.supabase.from("discount_codes").update({ active: form.get("active") === "true" }).eq("id", String(form.get("id")));
  revalidatePath("/admin/reduceri");
}

// ---------- Lot 1: comenzi, producție, brief, lead-uri ----------

async function companyContact(db: Awaited<ReturnType<typeof requireAdmin>>["supabase"], companyId: string) {
  const { data } = await db.from("companies").select("id, name, legal_rep, bank_reference, notify_email, billing_email, currency").eq("id", companyId).single();
  return data ? { ...data, to: (data.notify_email || data.billing_email) as string | null, first: (data.legal_rep || "").trim().split(/\s+/).pop() || data.name } : null;
}

export async function sendOrderReminder(form: FormData) {
  const s = await requireAdmin();
  const c = await companyContact(s.supabase, String(form.get("company_id")));
  const amount = Number(form.get("amount") || 0);
  if (!c?.to) return;
  await sendEmail({ db: s.supabase, companyId: c.id, template: "order_reminder_manual", to: c.to, subject: `Comanda ${c.bank_reference} așteaptă plata · LUNAR`,
    html: templates.orderReminder(c.first, money(amount, c.currency as Currency, 2), c.bank_reference, PAYEE.iban, Number(form.get("days_left") || 0), false) });
  revalidatePath("/admin", "layout");
}

export async function cancelOrder(form: FormData) {
  const s = await requireAdmin();
  await s.supabase.from("subscriptions").update({ status: "canceled", canceled_at: new Date().toISOString(), cancel_reason: "Comandă anulată manual" }).eq("id", String(form.get("sub_id"))).eq("status", "incomplete");
  revalidatePath("/admin", "layout");
}

export async function moveStage(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  const stage = String(form.get("stage"));
  if (!["brief", "design", "build", "qa", "live"].includes(stage)) return;
  if (stage === "live") {
    const { data: cur } = await s.supabase.from("launch_projects").select("checklist").eq("id", id).single();
    const cl = (cur?.checklist as Record<string, boolean>) ?? {};
    if (!CHECKLIST.every(([k]) => cl[k])) return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const { data: lp } = await s.supabase.from("launch_projects").update({ stage, completed_at: stage === "live" ? today : null }).eq("id", id).select("website_id, company_id").single();
  if (lp && stage === "live") await s.supabase.from("websites").update({ status: "live", launched_at: today }).eq("id", lp.website_id);
  if (lp) await onStageChange(s.supabase, lp.company_id, stage);
  revalidatePath("/admin", "layout");
}

/** Emailuri automate pe etape: la lansare, clientul primește confirmarea. Designul are propriul pas (sendDesign). */
async function onStageChange(db: Awaited<ReturnType<typeof requireAdmin>>["supabase"], companyId: string, stage: string) {
  if (stage !== "live") return;
  const c = await companyContact(db, companyId);
  const { data: w } = await db.from("websites").select("domain").eq("company_id", companyId).limit(1).maybeSingle();
  if (!c?.to || !w?.domain) return;
  await sendEmail({ db, companyId, template: "stage_live", to: c.to, subject: `${w.domain} este online · LUNAR`, html: templates.siteLive(c.first, w.domain) });
}

export async function setPause(form: FormData) {
  const s = await requireAdmin();
  const paused = form.get("paused") === "1";
  const reason = String(form.get("reason") || "").slice(0, 200) || null;
  await s.supabase.from("launch_projects").update({ sla_paused: paused, paused_reason: paused ? reason ?? "Așteptăm clientul" : null }).eq("id", String(form.get("id")));
  revalidatePath("/admin", "layout");
}

export async function sendBriefReminder(form: FormData) {
  const s = await requireAdmin();
  const c = await companyContact(s.supabase, String(form.get("company_id")));
  if (!c?.to) return;
  await sendEmail({ db: s.supabase, companyId: c.id, template: "brief_reminder_manual", to: c.to, subject: "Completează brief-ul website-ului · LUNAR", html: templates.briefReminder(c.first, false) });
  revalidatePath("/admin", "layout");
}

export async function updateLead(form: FormData) {
  const s = await requireAdmin();
  const status = String(form.get("status"));
  if (!["new", "contacted", "won", "lost"].includes(status)) return;
  await s.supabase.from("leads").update({ status, status_at: new Date().toISOString(), note: String(form.get("note") || "").slice(0, 2000) || null }).eq("id", String(form.get("id")));
  revalidatePath("/admin/lead-uri");
}

// ---------- Lot 2 ----------

export async function addNote(form: FormData) {
  const s = await requireAdmin();
  const body = String(form.get("body") || "").trim().slice(0, 4000);
  if (!body) return;
  await s.supabase.from("client_notes").insert({ company_id: String(form.get("company_id")), body, author: s.user!.id, author_email: s.user!.email });
  revalidatePath(`/admin/clienti/${form.get("company_id")}`);
}

export async function deleteNote(form: FormData) {
  const s = await requireAdmin();
  await s.supabase.from("client_notes").delete().eq("id", String(form.get("id")));
  revalidatePath(`/admin/clienti/${form.get("company_id")}`);
}

export async function pinNote(form: FormData) {
  const s = await requireAdmin();
  await s.supabase.from("client_notes").update({ pinned: form.get("pinned") === "1" }).eq("id", String(form.get("id")));
  revalidatePath(`/admin/clienti/${form.get("company_id")}`);
}

export async function sendUpgradeOffer(form: FormData) {
  const s = await requireAdmin();
  const c = await companyContact(s.supabase, String(form.get("company_id")));
  const from = String(form.get("from")) as PlanKey, to = String(form.get("to")) as PlanKey;
  if (!c?.to || !PLAN_DEFS[from] || !PLAN_DEFS[to]) return;
  await sendEmail({ db: s.supabase, companyId: c.id, template: "upgrade_offer", to: c.to, subject: `Planul ${PLAN_DEFS[to].name} ți se potrivește mai bine · LUNAR`,
    html: templates.upgradeOffer(c.first, PLAN_DEFS[from].name, PLAN_DEFS[to].name, Number(form.get("used") || 0), PLAN_DEFS[from].improvements, PLAN_DEFS[to].improvements) });
  revalidatePath("/admin", "layout");
}


export async function toggleChecklist(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id")), key = String(form.get("key"));
  if (!CHECKLIST.some(([k]) => k === key)) return;
  const { data } = await s.supabase.from("launch_projects").select("checklist").eq("id", id).single();
  const cl = { ...((data?.checklist as Record<string, boolean>) ?? {}), [key]: form.get("on") === "1" };
  await s.supabase.from("launch_projects").update({ checklist: cl }).eq("id", id);
  revalidatePath("/admin/lansari");
}

export async function runTechCheck(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  const { data: w } = await s.supabase.from("websites").select("domain").eq("id", id).single();
  if (!w?.domain || !w.domain.includes(".")) return;
  const r = await checkSite(w.domain);
  await s.supabase.from("websites").update({ ...r, cwv_ok: r.psi_mobile == null ? undefined : r.psi_mobile >= 90 }).eq("id", id);
  revalidatePath("/admin/tehnic");
}

export async function setSiteStatus(form: FormData) {
  const s = await requireAdmin();
  const status = String(form.get("status"));
  if (!["live", "suspended"].includes(status)) return;
  await s.supabase.from("websites").update({ status }).eq("id", String(form.get("id")));
  revalidatePath("/admin", "layout");
}

export async function sendLeadOffer(form: FormData) {
  const s = await requireAdmin();
  const leadId = String(form.get("lead_id"));
  const plan = String(form.get("plan")) as PlanKey;
  const percent = Math.max(5, Math.min(50, Number(form.get("percent") || 20)));
  const months = Math.max(1, Math.min(3, Number(form.get("months") || 1)));
  if (!PLAN_DEFS[plan]) return;
  const { data: lead } = await s.supabase.from("leads").select("id, name, email").eq("id", leadId).single();
  if (!lead) return;
  const code = `L${crypto.randomUUID().replace(/-/g, "").slice(0, 7).toUpperCase()}`;
  const ends = new Date(Date.now() + 72 * 3600e3).toISOString();
  const { error } = await s.supabase.from("discount_codes").insert({ code, description: `Ofertă pentru ${lead.name}`, kind: "percent", percent, months, plans: [plan], ends_at: ends, max_redemptions: 1, new_customers_only: true, lead_id: lead.id });
  if (error) return;
  const url = `${SITE_URL}/?comanda=1&plan=${plan}&cod=${code}`;
  await sendEmail({ db: s.supabase, template: "lead_offer", to: lead.email, subject: `Ofertă personală: ${percent}% reducere · LUNAR`,
    html: templates.leadOffer(lead.name.split(" ")[0], PLAN_DEFS[plan].name, percent, months, url, code) });
  await s.supabase.from("leads").update({ status: "contacted", status_at: new Date().toISOString(), note: `Ofertă ${code}: ${percent}% ${PLAN_DEFS[plan].name}, expiră ${ends.slice(0, 10)}` }).eq("id", lead.id);
  revalidatePath("/admin/lead-uri");
}

// ---------- Lot 3 ----------
export async function sendDesign(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  const url = String(form.get("url") || "").trim();
  if (!/^https?:\/\/\S+$/.test(url)) return;
  const { data: lp } = await s.supabase.from("launch_projects").update({ design_url: url.slice(0, 500), design_status: "pending", design_sent_at: new Date().toISOString(), design_feedback: null, design_decided_at: null }).eq("id", id).select("company_id").single();
  if (!lp) return;
  const c = await companyContact(s.supabase, lp.company_id);
  if (c?.to) await sendEmail({ db: s.supabase, companyId: c.id, template: "stage_design", to: c.to, subject: "Designul website-ului tău e gata · LUNAR", html: templates.designReady(c.first) });
  revalidatePath("/admin/lansari");
}

export async function saveTags(form: FormData) {
  const s = await requireAdmin();
  const tags = [...new Set(String(form.get("tags") || "").split(",").map((t) => t.trim().toLowerCase().replace(/[^\p{L}\p{N} -]/gu, "").slice(0, 30)).filter(Boolean))].slice(0, 12);
  await s.supabase.from("companies").update({ tags }).eq("id", String(form.get("company_id")));
  revalidatePath("/admin", "layout");
}

export async function logContact(companyId: string, channel: "whatsapp" | "phone" | "email", subject?: string) {
  const s = await requireAdmin();
  await s.supabase.from("contact_log").insert({ company_id: companyId, channel, subject: subject?.slice(0, 300) ?? null, author_email: s.user!.email });
  revalidatePath(`/admin/clienti/${companyId}`);
}

export async function saveRetention(form: FormData) {
  const s = await requireAdmin();
  const percent = Math.max(10, Math.min(100, Number(form.get("percent") || 50)));
  await s.supabase.from("app_settings").upsert({ key: "retention", value: { enabled: form.get("enabled") === "on", percent }, updated_at: new Date().toISOString() });
  revalidatePath("/admin/setari");
}

export async function sendBroadcast(_: ActionState, form: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  const audience = String(form.get("audience") || "active");
  const subject = String(form.get("subject") || "").trim().slice(0, 150);
  const body = String(form.get("body") || "").trim().slice(0, 8000);
  if (subject.length < 3 || body.length < 10) return { error: "Completează subiectul și mesajul." };
  if (form.get("confirm") !== "on") return { error: "Bifează confirmarea înainte de trimitere." };
  const { recipients } = await broadcastAudience(s.supabase, audience);
  if (!recipients.length) return { error: "Niciun destinatar pentru filtrul ales." };
  const html = templates.broadcast(subject, body);
  let sent = 0;
  for (const r of recipients) {
    const id = await sendEmail({ db: s.supabase, companyId: r.id, template: "broadcast", to: r.to, subject: `${subject} · LUNAR`, html });
    if (id) { sent++; await s.supabase.from("contact_log").insert({ company_id: r.id, channel: "broadcast", subject, author_email: s.user!.email }); }
  }
  revalidatePath("/admin/mesaje");
  return { ok: `Trimis către ${sent} din ${recipients.length} clienți.` };
}

async function broadcastAudience(db: Awaited<ReturnType<typeof requireAdmin>>["supabase"], audience: string) {
  const [{ data: cos }, { data: subs }] = await Promise.all([
    db.from("companies").select("id, name, tags, notify_email, billing_email, is_demo"),
    db.from("subscriptions").select("company_id, plan, status, created_at").order("created_at", { ascending: false }),
  ]);
  const last = new Map<string, { plan: string; status: string }>();
  for (const x of subs ?? []) if (!last.has(x.company_id)) last.set(x.company_id, x);
  const recipients = (cos ?? []).filter((c) => !c.is_demo && (c.notify_email || c.billing_email)).filter((c) => {
    const sub = last.get(c.id);
    const active = sub && ["active", "past_due"].includes(sub.status);
    if (audience === "active") return active;
    if (audience.startsWith("plan:")) return active && sub!.plan === audience.slice(5);
    if (audience.startsWith("tag:")) return (c.tags as string[] ?? []).includes(audience.slice(4));
    return false;
  }).map((c) => ({ id: c.id as string, name: c.name as string, to: (c.notify_email || c.billing_email) as string }));
  return { recipients };
}

// ---------- Lot 4 ----------
export async function deleteDiscount(form: FormData) {
  const s = await requireAdmin();
  const id = String(form.get("id"));
  if (form.get("confirm") !== "STERGE") return;
  await s.supabase.from("discount_codes").delete().eq("id", id);
  revalidatePath("/admin/reduceri");
}

export async function sendAnniversary(form: FormData) {
  const s = await requireAdmin();
  const months = Number(form.get("months")) === 12 ? 12 : 6;
  const c = await companyContact(s.supabase, String(form.get("company_id")));
  if (!c?.to) return;
  const { data: w } = await s.supabase.from("websites").select("domain").eq("company_id", c.id).limit(1).maybeSingle();
  await sendEmail({ db: s.supabase, companyId: c.id, template: `anniversary_${months}`, to: c.to, subject: `${months === 12 ? "Un an" : "Șase luni"} împreună · LUNAR`, html: templates.anniversary(c.first, months, w?.domain ?? null) });
  revalidatePath("/admin", "layout");
}

export async function completeHandover(form: FormData) {
  const s = await requireAdmin();
  const companyId = String(form.get("company_id"));
  const today = new Date().toISOString().slice(0, 10);
  const { data: w } = await s.supabase.from("websites").select("id, domain").eq("company_id", companyId).limit(1).maybeSingle();
  if (!w) return;
  await s.supabase.from("ownership").upsert({ website_id: w.id, company_id: companyId, transferred_at: today, handover_sent_at: new Date().toISOString() }, { onConflict: "website_id" });
  await s.supabase.from("websites").update({ status: "transferred" }).eq("id", w.id);
  const c = await companyContact(s.supabase, companyId);
  if (c?.to) await sendEmail({ db: s.supabase, companyId, template: "handover", to: c.to, subject: `${w.domain} este al tău · LUNAR`, html: templates.handover(c.first, w.domain) });
  revalidatePath("/admin", "layout");
}

export async function saveBrandKit(form: FormData) {
  const s = await requireAdmin();
  const str = (k: string, n = 300) => String(form.get(k) || "").trim().slice(0, n);
  const brand = { colors: str("colors"), fonts: str("fonts"), tone: str("tone", 600), notes: str("notes", 2000), links: str("links", 1000) };
  await s.supabase.from("companies").update({ brand }).eq("id", String(form.get("company_id")));
  revalidatePath(`/admin/clienti/${form.get("company_id")}`);
}

export async function uploadAsset(form: FormData) {
  const s = await requireAdmin();
  const companyId = String(form.get("company_id"));
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 10);
  for (const f of files) {
    if (f.size > 20 * 1024 * 1024) continue;
    const safe = f.name.normalize("NFKD").replace(/[^\w.-]+/g, "-").slice(-80);
    await s.supabase.storage.from("documents").upload(`${companyId}/assets/${Date.now()}-${safe}`, f, { contentType: f.type || undefined, upsert: false });
  }
  revalidatePath(`/admin/clienti/${companyId}`);
}

export async function deleteAsset(form: FormData) {
  const s = await requireAdmin();
  const companyId = String(form.get("company_id")), path = String(form.get("path"));
  if (!path.startsWith(`${companyId}/assets/`)) return;
  await s.supabase.storage.from("documents").remove([path]);
  revalidatePath(`/admin/clienti/${companyId}`);
}

/** Jurnal de acces: o intrare la 12 ore per browser; alertă pe email la dispozitiv nou. */
export async function recordAdminVisit() {
  const s = await requireAdmin();
  const { cookies: ck, headers: hd } = await import("next/headers");
  const store = await ck();
  if (store.get("lunar_adm_seen")) return;
  const h = await hd();
  const ua = (h.get("user-agent") || "").slice(0, 300);
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64) || null;
  const device = `${/iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : "Altul"} · ${/Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Browser"}`;
  const { count } = await s.supabase.from("admin_logins").select("id", { count: "exact", head: true }).eq("user_id", s.user!.id).eq("device", device);
  const isNew = (count ?? 0) === 0;
  await s.supabase.from("admin_logins").insert({ user_id: s.user!.id, email: s.user!.email, ip, user_agent: ua, device, new_device: isNew });
  store.set("lunar_adm_seen", "1", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 12 });
  const { count: total } = await s.supabase.from("admin_logins").select("id", { count: "exact", head: true }).eq("user_id", s.user!.id);
  if (isNew && (total ?? 0) > 1 && s.user!.email) {
    await sendEmail({ template: "admin_new_device", to: s.user!.email, subject: "Autentificare în admin de pe un dispozitiv nou · LUNAR",
      html: templates.adminNotice("Autentificare nouă în admin", { Cont: s.user!.email, Dispozitiv: device, IP: ip, Ora: new Date().toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" }), "Nu ai fost tu?": "Schimbă parola imediat din Admin → Parolă." }) });
  }
}

/** Recomandare: la prima plată a clientului adus, următoarea rată a celui care a recomandat devine gratuită. */
async function rewardReferrer(db: Awaited<ReturnType<typeof requireAdmin>>["supabase"], companyId: string) {
  const { data: ref } = await db.from("referrals").select("id, referrer_company_id").eq("referred_company_id", companyId).eq("status", "converted").limit(1).maybeSingle();
  if (!ref) return;
  const { data: nxt } = await db.from("installments").select("id, due_date, amount_plan, amount_addons").eq("company_id", ref.referrer_company_id).neq("status", "paid").gt("number", 1).order("number").limit(1).maybeSingle();
  if (!nxt) return;
  await db.from("installments").update({ amount_discount: Number(nxt.amount_plan) + Number(nxt.amount_addons) }).eq("id", nxt.id);
  await db.from("referrals").update({ status: "rewarded", reward_month: String(nxt.due_date).slice(0, 7) + "-01" }).eq("id", ref.id);
}
