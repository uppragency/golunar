import { NextResponse, after } from "next/server";
import { syncContact } from "@/lib/contacts";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { layout, sendEmail, templates } from "@/lib/email";
import { getRef, getSource } from "@/lib/ref";
import { CONTACT_TOPICS } from "@/lib/contact";
import { reportError } from "@/lib/report";

const Body = z.object({
  category: z.enum(["nou", "client", "parteneriat", "altceva"]),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(5).max(3000),
  marketing: z.union([z.literal("1"), z.boolean()]).optional(),
  website: z.string().optional(), // honeypot
});

// Limită simplă per instanță: 5 mesaje / oră / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (list.length >= 5) return true;
  hits.set(ip, [...list, now]);
  return false;
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Completează numele, un email valid și mesajul." }, { status: 400 });
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true });
  const ip = ((await headers()).get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return NextResponse.json({ error: "Ai trimis prea multe mesaje. Încearcă din nou peste o oră sau scrie la hello@golunar.ro." }, { status: 429 });

  const label = CONTACT_TOPICS.find((t) => t.id === d.category)!.label;
  const marketing = (d.marketing === true || d.marketing === "1") && (d.category === "nou" || d.category === "altceva");
  const sb = await createClient();
  const ref = await getRef();
  const { error } = await sb.rpc("submit_lead", {
    p_name: d.name, p_email: d.email, p_phone: d.phone, p_company: d.company, p_message: `[${label}] ${d.message}`,
    p_plan: "", p_source: "contact", p_ref: ref ?? "", p_meta: { src: await getSource(), category: d.category, marketing },
  });
  after(() => syncContact({ email: d.email, name: d.name, phone: d.phone, kind: "lead", marketing, tags: ["lead-contact", `contact-${d.category}`] }));
  if (error) reportError("contact", error, { category: d.category });

  await sendEmail({
    template: "admin_lead", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", replyTo: d.email,
    subject: `Contact · ${label}: ${d.company || d.name}`,
    html: templates.adminNotice(`Mesaj nou din pagina Contact`, { Subiect: label, Nume: d.name, Firmă: d.company, Email: d.email, Telefon: d.phone, Mesaj: d.message, Recomandare: ref ?? "" }),
  });
  await sendEmail({
    template: "contact_confirm", to: d.email, subject: "Am primit mesajul tău · LUNAR",
    html: layout({
      preheader: "Îți răspundem în cel mult o zi lucrătoare.", eyebrow: "Contact", title: "Am primit mesajul.", titleDim: "Revenim în cel mult o zi lucrătoare.",
      body: `<p style="margin:0 0 14px">Mulțumim, ${d.name.split(/\s+/)[0].replace(/[<>&"']/g, "")}. Mesajul tău despre „${label}” a ajuns la noi și îți răspundem pe acest email în cel mult o zi lucrătoare.</p><p style="margin:0">Dacă vrei să adaugi ceva, răspunde direct la acest email.</p>`,
      foot: "Ai primit acest email pentru că ai trimis un mesaj din pagina de contact golunar.ro.",
    }),
  });
  return NextResponse.json({ ok: true });
}
