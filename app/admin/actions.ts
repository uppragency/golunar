"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, VIEW_AS_COOKIE } from "@/lib/session";
import { provision, startLaunch } from "@/lib/provision";
import { createSmartbillInvoice } from "@/lib/smartbill";
import { sendEmail, templates } from "@/lib/email";
import { money } from "@/lib/format";
import type { Currency } from "@/lib/plans";

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
      cart: { plan: d.plan, brand: Boolean(d.brand), local: Boolean(d.local), langs: d.langs },
      currency: d.currency,
      mode: d.mode,
      start: new Date(`${d.start}T00:00:00Z`),
      firstPaid: Boolean(d.first_paid),
    });
    companyId = res.companyId;
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
