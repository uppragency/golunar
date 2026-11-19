"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPortalContext } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { sendEmail, templates } from "@/lib/email";

export type ActionState = { ok?: string; error?: string } | null;

const RequestSchema = z.object({
  type: z.enum(["improvement", "bug", "billing"]),
  title: z.string().trim().min(3, "Titlul are minimum 3 caractere.").max(160),
  body: z.string().trim().max(5000).optional().default(""),
});

export async function createRequest(_: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || !ctx.canEdit) return { error: "Nu ai drepturi să trimiți cereri." };
  const parsed = RequestSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  let attachments: { path: string; name: string; size: number }[] = [];
  try {
    attachments = (JSON.parse(String(form.get("attachments") || "[]")) as typeof attachments)
      .filter((f) => typeof f.path === "string" && f.path.startsWith(`${ctx.companyId}/requests/`)).slice(0, 5);
  } catch {}
  const page = String(form.get("page") || "").trim().slice(0, 300);
  const body = [page ? `Pagina: ${page}` : "", parsed.data.body].filter(Boolean).join("\n\n").slice(0, 5000);
  const { error } = await ctx.supabase.from("requests").insert({ company_id: ctx.companyId, created_by: ctx.user!.id, ...parsed.data, body, attachments });
  if (error) return { error: error.message.includes("îmbunătățirile") ? error.message : "Cererea nu a putut fi salvată." };
  if (ctx.user?.email) await sendEmail({ template: "request_received", to: ctx.user.email, subject: "Am primit cererea ta · LUNAR", html: templates.requestReceived(parsed.data.title) });
  await sendEmail({ template: "admin_request", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Cerere nouă: ${parsed.data.title}`,
    html: templates.adminNotice("Cerere nouă de la client", { Tip: parsed.data.type, Titlu: parsed.data.title, Pagina: page, Detalii: parsed.data.body, Atașamente: attachments.length ? String(attachments.length) : "", Utilizator: ctx.user?.email }) });
  revalidatePath("/cont", "layout");
  return { ok: "Cerere trimisă. Primești confirmarea pe email." };
}

const CompanySchema = z.object({
  name: z.string().trim().min(2).max(200),
  cui: z.string().trim().min(2).max(14),
  reg_com: z.string().trim().max(40).optional().default(""),
  vat_payer: z.enum(["true", "false"]),
  address: z.string().trim().max(300).optional().default(""),
  bank: z.string().trim().max(120).optional().default(""),
  iban: z.string().trim().max(40).optional().default(""),
  legal_rep: z.string().trim().max(120).optional().default(""),
  billing_email: z.union([z.email(), z.literal("")]),
  notify_email: z.union([z.email(), z.literal("")]),
  phone: z.string().trim().max(40).optional().default(""),
});

export async function updateCompany(_: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || !(ctx.role === "owner" || ctx.role === "billing")) return { error: "Doar owner sau billing pot modifica datele." };
  const parsed = CompanySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Verifică emailurile și câmpurile obligatorii." };
  const d = parsed.data;
  const { error } = await ctx.supabase
    .from("companies")
    .update({ ...d, vat_payer: d.vat_payer === "true", reg_com: d.reg_com || null, billing_email: d.billing_email || null, notify_email: d.notify_email || null })
    .eq("id", ctx.companyId);
  if (error) return { error: error.code === "23505" ? "Există deja o firmă cu acest CUI." : "Nu am putut salva." };
  revalidatePath("/cont", "layout");
  return { ok: "Date salvate. Se aplică de la următoarea factură." };
}

export async function requestBankTransfer(): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || !ctx.canEdit) return { error: "Nu ai drepturi." };
  const { error } = await ctx.supabase.from("requests").insert({ company_id: ctx.companyId, created_by: ctx.user!.id, type: "billing", title: "Trecere pe plată prin transfer bancar" });
  if (error) return { error: "Cererea nu a putut fi trimisă." };
  revalidatePath("/cont", "layout");
  return { ok: "Am primit cererea. Confirmăm trecerea pe transfer în 48h lucrătoare." };
}

export async function cancelSubscription(): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || ctx.role !== "owner") return { error: "Doar owner-ul firmei poate anula abonamentul." };
  const { data: sub } = await ctx.supabase.from("subscriptions").select("id, stripe_subscription_id, status, min_commitment_months").eq("company_id", ctx.companyId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!sub || sub.status === "canceled") return { error: "Nu există un abonament activ." };
  const min = sub.min_commitment_months ?? 0;
  if (min > 1) {
    const { count } = await ctx.supabase.from("installments").select("id", { count: "exact", head: true }).eq("subscription_id", sub.id).eq("status", "paid");
    if ((count ?? 0) < min) return { error: `Planul tău are o perioadă minimă de ${min} luni. Poți anula după a ${min}-a plată (ai ${count ?? 0} din ${min}).` };
  }
  const s = stripe();
  if (s && sub.stripe_subscription_id) {
    try {
      await s.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
    } catch {
      return { error: "Anularea nu a putut fi procesată. Scrie-ne la hello@golunar.ro." };
    }
  }
  await ctx.supabase.from("requests").insert({ company_id: ctx.companyId, created_by: ctx.user!.id, type: "billing", title: "Anulare abonament la finalul perioadei plătite" });
  await sendEmail({ template: "admin_cancel", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: "Cerere de anulare abonament", html: templates.adminNotice("Anulare abonament", { Firmă: ctx.companyId, Utilizator: ctx.user?.email }) });
  revalidatePath("/cont", "layout");
  return { ok: "Abonamentul se oprește la finalul perioadei plătite. Îți trimitem confirmarea pe email." };
}

export async function saveBrief(_: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || !ctx.canEdit) return { error: "Nu ai drepturi să editezi brief-ul." };
  const { BRIEF_KEYS, BRIEF_MAX_FILES } = await import("@/lib/brief");
  const submit = form.get("intent") === "submit";
  const answers: Record<string, string> = {};
  for (const q of BRIEF_KEYS) {
    const v = q.kind === "multi" ? form.getAll(q.key).map(String).join(", ") : String(form.get(q.key) ?? "");
    answers[q.key] = v.trim().slice(0, 4000);
  }
  if (submit) {
    const missing = BRIEF_KEYS.filter((q) => q.required && !answers[q.key]).map((q) => q.label);
    if (missing.length) return { error: `Completează: ${missing.join("; ")}` };
  }
  let files: { path: string; name: string; size: number }[] = [];
  try {
    files = (JSON.parse(String(form.get("files") || "[]")) as typeof files)
      .filter((f) => typeof f.path === "string" && f.path.startsWith(`${ctx.companyId}/brief/`))
      .slice(0, BRIEF_MAX_FILES);
  } catch {}
  const { data: prev } = await ctx.supabase.from("briefs").select("submitted_at").eq("company_id", ctx.companyId).maybeSingle();
  const { error } = await ctx.supabase.from("briefs").upsert({
    company_id: ctx.companyId,
    answers,
    description: String(form.get("description") ?? "").trim().slice(0, 20000) || null,
    examples: String(form.get("examples") ?? "").trim().slice(0, 3000) || null,
    files,
    submitted_at: submit ? prev?.submitted_at ?? new Date().toISOString() : prev?.submitted_at ?? null,
    updated_by: ctx.user?.id ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Nu am putut salva brief-ul. Încearcă din nou." };
  if (submit) {
    const { data: c } = await ctx.supabase.from("companies").select("name").eq("id", ctx.companyId).single();
    await sendEmail({ template: "admin_brief", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", replyTo: ctx.user?.email ?? undefined,
      subject: `${prev?.submitted_at ? "Brief actualizat" : "Brief nou"}: ${c?.name ?? ""}`,
      html: templates.adminNotice(prev?.submitted_at ? "Brief actualizat" : "Brief trimis", { Firmă: c?.name, Scop: answers.goal, Pagini: answers.pages, Fișiere: String(files.length), Utilizator: ctx.user?.email }) });
    if (!prev?.submitted_at && ctx.user?.email) {
      const { data: lp } = await ctx.supabase.from("launch_projects").select("due_at").eq("company_id", ctx.companyId).maybeSingle();
      const due = lp?.due_at ? new Date(lp.due_at).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }) : "10 zile lucrătoare";
      await sendEmail({ db: ctx.supabase, companyId: ctx.companyId, template: "stage_brief", to: ctx.user.email, subject: "Am primit brief-ul · LUNAR", html: templates.briefReceived(c?.name ?? "", due) });
    }
  }
  revalidatePath("/cont", "layout");
  return { ok: submit ? "Brief trimis. Îl citim azi și revenim dacă lipsește ceva." : "Ciornă salvată." };
}

// ---------- aprobare design ----------
export async function decideDesign(_: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || !ctx.canEdit) return { error: "Nu ai drepturi." };
  const decision = form.get("decision") === "approved" ? "approved" : "changes";
  const feedback = String(form.get("feedback") || "").trim();
  if (decision === "changes" && feedback.length < 5) return { error: "Scrie pe scurt ce ai vrea să schimbăm." };
  const { error } = await ctx.supabase.rpc("portal_design_decide", { p_company: ctx.companyId, p_decision: decision, p_feedback: feedback });
  if (error) return { error: "Nu am putut salva răspunsul. Încearcă din nou." };
  const { data: c } = await ctx.supabase.from("companies").select("name").eq("id", ctx.companyId).single();
  await sendEmail({ template: "admin_design", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", replyTo: ctx.user?.email ?? undefined,
    subject: `${decision === "approved" ? "Design aprobat" : "Ajustări cerute la design"}: ${c?.name ?? ""}`,
    html: templates.adminNotice(decision === "approved" ? "Design aprobat" : "Ajustări cerute", { Firmă: c?.name, Mesaj: feedback || "—", Utilizator: ctx.user?.email }) });
  revalidatePath("/cont", "layout");
  return { ok: decision === "approved" ? "Mulțumim! Trecem la dezvoltare." : "Am primit ajustările. Revenim cu varianta nouă." };
}

// ---------- anulare cu motiv + ofertă de retenție ----------
export async function cancelWithReason(_: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || ctx.role !== "owner") return { error: "Doar owner-ul firmei poate anula abonamentul." };
  const category = String(form.get("category") || "").trim();
  const detail = String(form.get("detail") || "").trim().slice(0, 500);
  if (!category) return { error: "Alege motivul anulării." };
  const { data: sub } = await ctx.supabase.from("subscriptions").select("id, stripe_subscription_id, status, min_commitment_months").eq("company_id", ctx.companyId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!sub || sub.status === "canceled") return { error: "Nu există un abonament activ." };
  const min = sub.min_commitment_months ?? 0;
  if (min > 1) {
    const { count } = await ctx.supabase.from("installments").select("id", { count: "exact", head: true }).eq("subscription_id", sub.id).eq("status", "paid");
    if ((count ?? 0) < min) return { error: `Planul tău are o perioadă minimă de ${min} luni. Poți anula după a ${min}-a plată (ai ${count ?? 0} din ${min}).` };
  }
  const s = stripe();
  if (s && sub.stripe_subscription_id) {
    try { await s.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true }); } catch { return { error: "Anularea nu a putut fi procesată. Scrie-ne la hello@golunar.ro." }; }
  }
  const { data: until, error } = await ctx.supabase.rpc("portal_cancel", { p_company: ctx.companyId, p_category: category, p_detail: detail });
  if (error) return { error: "Anularea nu a putut fi procesată. Scrie-ne la hello@golunar.ro." };
  await ctx.supabase.from("requests").insert({ company_id: ctx.companyId, created_by: ctx.user!.id, type: "billing", title: `Anulare abonament: ${category}` });
  const { data: c } = await ctx.supabase.from("companies").select("name").eq("id", ctx.companyId).single();
  await sendEmail({ template: "admin_cancel", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Anulare abonament: ${c?.name ?? ""}`, html: templates.adminNotice("Anulare abonament", { Firmă: c?.name, Motiv: category, Detalii: detail || "—", Utilizator: ctx.user?.email }) });
  revalidatePath("/cont", "layout");
  return { ok: `Abonamentul se oprește pe ${new Date(String(until)).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}. Nu mai urmează alte plăți.` };
}

export async function acceptRetention(): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || ctx.role !== "owner") return { error: "Doar owner-ul firmei poate face această alegere." };
  const { data, error } = await ctx.supabase.rpc("portal_retention_accept", { p_company: ctx.companyId });
  if (error) return { error: "Oferta nu mai este disponibilă." };
  const r = data as { number: number; percent: number };
  const { data: c } = await ctx.supabase.from("companies").select("name").eq("id", ctx.companyId).single();
  await sendEmail({ template: "admin_retention", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Client păstrat cu oferta de retenție: ${c?.name ?? ""}`, html: templates.adminNotice("Ofertă de retenție acceptată", { Firmă: c?.name, Reducere: `${r.percent}% la rata ${r.number}` }) });
  revalidatePath("/cont", "layout");
  return { ok: `Gata! Rata ${r.number} are ${r.percent}% reducere. Mulțumim că rămâi cu noi.` };
}

// ---------- plată cu un click: „Am plătit” ----------
export async function notifyPayment(installmentId: string): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId) return { error: "Nu ai drepturi." };
  const { error } = await ctx.supabase.rpc("portal_notify_payment", { p_company: ctx.companyId, p_installment: installmentId });
  if (error) return { error: "Nu am putut trimite confirmarea." };
  const { data: c } = await ctx.supabase.from("companies").select("name, bank_reference").eq("id", ctx.companyId).single();
  const { data: i } = await ctx.supabase.from("installments").select("number, amount_net, currency").eq("id", installmentId).single();
  await sendEmail({ template: "admin_payment_notified", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Plată anunțată: ${c?.name ?? ""}`,
    html: templates.adminNotice("Clientul a anunțat plata", { Firmă: c?.name, Referință: c?.bank_reference, Rata: i ? `${i.number}/12` : "", Suma: i ? `${Number(i.amount_net).toFixed(2)} ${i.currency === "EUR" ? "€" : "lei"}` : "", Utilizator: ctx.user?.email }) });
  revalidatePath("/cont", "layout");
  return { ok: "Mulțumim! Confirmăm plata după ce apare în extras, de obicei în aceeași zi lucrătoare." };
}

// ---------- magazin de opțiuni ----------
export async function activateAddon(_: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await getPortalContext();
  if (!ctx.companyId || ctx.role !== "owner") return { error: "Doar owner-ul firmei poate activa opțiuni." };
  const addon = String(form.get("addon"));
  const qty = Number(form.get("qty") || 1);
  const { data, error } = await ctx.supabase.rpc("portal_addon_activate", { p_company: ctx.companyId, p_addon: addon, p_qty: qty });
  if (error) return { error: error.message.includes("exists") ? "Opțiunea este deja activă." : "Opțiunea nu a putut fi activată. Scrie-ne la hello@golunar.ro." };
  const r = data as { price: number; currency: string; installments: number };
  const { data: c } = await ctx.supabase.from("companies").select("name").eq("id", ctx.companyId).single();
  const names: Record<string, string> = { brand: "Identitate vizuală", local: "Vizibilitate locală Google", lang: "Limbă suplimentară" };
  await ctx.supabase.from("requests").insert({ company_id: ctx.companyId, created_by: ctx.user!.id, type: "billing", title: `Opțiune activată: ${names[addon] ?? addon}${addon === "lang" ? ` × ${qty}` : ""}` });
  await sendEmail({ template: "admin_addon", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Opțiune activată: ${names[addon]} · ${c?.name ?? ""}`,
    html: templates.adminNotice("Client a activat o opțiune", { Firmă: c?.name, Opțiune: names[addon], Cantitate: String(qty), Preț: `${r.price} ${r.currency === "EUR" ? "€" : "lei"} / lună`, Rate: String(r.installments) }) });
  revalidatePath("/cont", "layout");
  return { ok: `${names[addon]} este activă de la rata următoare. Te contactăm pentru detalii.` };
}
