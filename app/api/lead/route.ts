import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, templates } from "@/lib/email";
import { getRef, getSource } from "@/lib/ref";

const Lead = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  plan: z.enum(["essential", "growth", "partner"]).optional(),
  website: z.string().optional(), // honeypot
  marketing: z.union([z.literal("1"), z.boolean()]).optional(),
});

export async function POST(req: Request) {
  const parsed = Lead.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Verifică numele și adresa de email." }, { status: 400 });
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true }); // bot
  const supabase = await createClient();
  const ref = await getRef();
  const { error } = await supabase.rpc("submit_lead", {
    p_name: d.name, p_email: d.email, p_phone: d.phone, p_company: d.company, p_message: d.message,
    p_plan: d.plan ?? "", p_source: "discutie-gratuita", p_ref: ref ?? "", p_meta: { src: await getSource(), marketing: d.marketing === true || d.marketing === "1" },
  });
  if (error) console.error("[lead]", error.message);
  await sendEmail({
    template: "admin_lead",
    to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro",
    subject: `Discuție nouă: ${d.company || d.name}`,
    html: templates.adminNotice("Cerere de discuție gratuită", { Nume: d.name, Firmă: d.company, Email: d.email, Telefon: d.phone, Plan: d.plan, Mesaj: d.message, Recomandare: ref ?? "" }),
    replyTo: d.email,
  });
  return NextResponse.json({ ok: true });
}
