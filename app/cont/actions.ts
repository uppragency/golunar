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
  const { error } = await ctx.supabase.from("requests").insert({ company_id: ctx.companyId, created_by: ctx.user!.id, ...parsed.data });
  if (error) return { error: error.message.includes("îmbunătățirile") ? error.message : "Cererea nu a putut fi salvată." };
  if (ctx.user?.email) await sendEmail({ template: "request_received", to: ctx.user.email, subject: "Am primit cererea ta · LUNAR", html: templates.requestReceived(parsed.data.title) });
  await sendEmail({ template: "admin_request", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", subject: `Cerere nouă: ${parsed.data.title}`,
    html: templates.adminNotice("Cerere nouă de la client", { Tip: parsed.data.type, Titlu: parsed.data.title, Detalii: parsed.data.body, Utilizator: ctx.user?.email }) });
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
  const { data: sub } = await ctx.supabase.from("subscriptions").select("id, stripe_subscription_id, status").eq("company_id", ctx.companyId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!sub || sub.status === "canceled") return { error: "Nu există un abonament activ." };
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
