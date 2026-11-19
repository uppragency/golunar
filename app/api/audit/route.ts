import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { normalizeUrl, runAudit, topIssues } from "@/lib/audit";
import { auditReport, sendEmail, templates } from "@/lib/email";
import { getRef } from "@/lib/ref";

export const maxDuration = 60;

const Body = z.object({
  url: z.string().trim().min(4).max(300),
  email: z.email().max(200),
  name: z.string().trim().min(2).max(120),
  website: z.string().optional(), // honeypot
});

// Limită simplă per instanță: 5 audituri / oră / IP.
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
  if (!parsed.success) return NextResponse.json({ error: "Completează adresa site-ului, numele și emailul." }, { status: 400 });
  const d = parsed.data;
  if (d.website) return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  const url = normalizeUrl(d.url);
  if (!url) return NextResponse.json({ error: "Adresa nu pare validă. Exemplu: firmata.ro" }, { status: 400 });
  const ip = ((await headers()).get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
  if (limited(ip)) return NextResponse.json({ error: "Ai atins limita de 5 audituri pe oră. Încearcă mai târziu." }, { status: 429 });

  let result;
  try {
    result = await runAudit(url);
  } catch {
    return NextResponse.json({ error: "Nu am putut deschide site-ul. Verifică adresa sau încearcă din nou în câteva minute." }, { status: 422 });
  }
  const issues = topIssues(result);
  const s = result.scores;

  const supabase = await createClient();
  const ref = await getRef();
  const { error } = await supabase.rpc("submit_lead", {
    p_name: d.name, p_email: d.email, p_phone: "", p_company: "", p_message: `Audit: ${result.finalUrl}`,
    p_plan: "", p_source: "audit", p_ref: ref ?? "",
    p_meta: { url: result.finalUrl, psi: result.psi, scores: s, failed: result.checks.filter((c) => !c.ok).map((c) => c.id) },
  });
  if (error) console.error("[audit] lead", error.message);

  await sendEmail({
    template: "audit_report", to: d.email, subject: `Auditul gratuit pentru ${new URL(result.finalUrl).hostname}`,
    html: auditReport({
      url: result.finalUrl,
      scores: [
        { label: "Viteză", value: s.performance }, { label: "SEO", value: s.seo },
        { label: "Accesibilitate", value: s.accessibility }, { label: "Bune practici", value: s.bestPractices },
      ].filter((x) => result.psi || x.label === "SEO"),
      issues, lcp: result.metrics.lcp, cls: result.metrics.cls, tbt: result.metrics.tbt,
    }),
  });
  await sendEmail({
    template: "admin_lead", to: process.env.ADMIN_NOTIFY_EMAIL || "hello@golunar.ro", replyTo: d.email,
    subject: `Audit nou: ${new URL(result.finalUrl).hostname}`,
    html: templates.adminNotice("Lead nou din auditul gratuit", {
      Nume: d.name, Email: d.email, Site: result.finalUrl, Viteză: s.performance?.toString(), SEO: s.seo?.toString(),
      Accesibilitate: s.accessibility?.toString(), Probleme: issues.slice(0, 4).join(" · "), Recomandare: ref ?? "",
    }),
  });

  return NextResponse.json({ ok: true, result, issues });
}
