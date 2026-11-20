import { NextResponse } from "next/server";
import { createClient as createAnon } from "@supabase/supabase-js";
import { Resend } from "resend";
import { SITE_URL, SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { monthlyReport } from "@/lib/email";
import { reportError } from "@/lib/report";

export const maxDuration = 60;

type Payload = {
  company_id: string; company: string; legal_rep: string | null; to: string; referral_code: string; domain: string | null; uptime: number | null;
  metrics: { month: string; visitors: number; leads: number; pos: number | null; calls: number | null }[] | null;
  delivered: { title: string; date: string }[]; paid: number; last_due: string | null; transferred_at: string | null;
};

/** Raport lunar automat. Apelat de pg_cron (ziua 3, 07:00 UTC) cu Authorization: Bearer CRON_SECRET. Idempotent per lună. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const key = process.env.RESEND_API_KEY;
  if (!key) { reportError("cron-monthly-report", "RESEND_API_KEY missing"); return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 }); }

  const now = new Date();
  const p = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const period = p.toISOString().slice(0, 10);
  const monthLabel = p.toLocaleDateString("ro-RO", { month: "long", year: "numeric", timeZone: "UTC" });

  const db = createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.rpc("monthly_report_payloads", { p_secret: secret, p_period: period });
  if (error) { reportError("cron-monthly-report", error); return NextResponse.json({ error: error.message }, { status: 500 }); }

  const resend = new Resend(key);
  let sent = 0, failed = 0;
  for (const r of (data ?? []) as Payload[]) {
    const m = r.metrics ?? [];
    const cur = m[0] && m[0].month.slice(0, 7) === period.slice(0, 7) ? m[0] : null;
    const prev = cur ? m[1] ?? null : null;
    const owner = r.transferred_at || r.paid >= 12
      ? "website-ul este al tău"
      : r.last_due ? `al tău în ${new Date(r.last_due).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}` : "al tău după 12 plăți";
    const html = monthlyReport({
      monthLabel, name: (r.legal_rep || "").split(" ").pop() || r.company, domain: r.domain, uptime: r.uptime != null ? +r.uptime : null,
      cur: cur ? { visitors: cur.visitors, leads: cur.leads, pos: cur.pos != null ? +cur.pos : null, calls: cur.calls } : null,
      prev: prev ? { visitors: prev.visitors, leads: prev.leads, pos: prev.pos != null ? +prev.pos : null, calls: prev.calls } : null,
      delivered: r.delivered ?? [], paid: r.paid, ownerLabel: owner, refLink: `${SITE_URL}/?ref=${r.referral_code}`,
    });
    const { data: res, error: e } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "LUNAR <hello@golunar.ro>", to: r.to, replyTo: "hello@golunar.ro",
      subject: `Raportul LUNAR · ${monthLabel}${r.domain ? ` · ${r.domain}` : ""}`, html,
    });
    // doar trimiterile reușite blochează retrimiterea pe aceeași perioadă
    await db.rpc("log_cron_email", { p_secret: secret, p_company: r.company_id, p_template: "monthly_report", p_to: r.to, p_resend_id: res?.id ?? null, p_period: e ? null : period, p_status: e ? "failed" : "sent" });
    if (e) failed++; else sent++;
  }
  return NextResponse.json({ period, sent, failed });
}
