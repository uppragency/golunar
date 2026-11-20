import { NextResponse } from "next/server";
import { createClient as createAnon } from "@supabase/supabase-js";
import { Resend } from "resend";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { templates } from "@/lib/email";
import { money } from "@/lib/format";
import type { Currency } from "@/lib/plans";
import { reportError, rpcRetry } from "@/lib/report";

export const maxDuration = 60;

type Job = {
  kind: "order_reminder_1" | "order_reminder_2" | "order_expired" | "brief_reminder_1" | "brief_reminder_2" | "free_month" | "overdue_1" | "overdue_5" | "overdue_10";
  company_id: string; to: string; name: string; rep: string | null; period: string;
  reference?: string; amount?: number; currency?: Currency; iban?: string; days_left?: number; number?: number; due?: string; domain?: string | null;
};

const first = (j: Job) => (j.rep || "").trim().split(/\s+/).pop() || j.name;
const date = (d?: string) => (d ? new Date(d).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }) : "");

function render(j: Job): { subject: string; html: string } | null {
  const amt = j.amount != null ? money(+j.amount, j.currency ?? "RON", 2) : "";
  switch (j.kind) {
    case "order_reminder_1":
    case "order_reminder_2":
      return { subject: `Comanda ${j.reference} așteaptă plata · LUNAR`, html: templates.orderReminder(first(j), amt, j.reference!, j.iban!, j.days_left ?? 0, j.kind === "order_reminder_2") };
    case "order_expired":
      return { subject: `Comanda ${j.reference} a expirat · LUNAR`, html: templates.orderExpired(first(j), j.reference!) };
    case "brief_reminder_1":
    case "brief_reminder_2":
      return { subject: "Completează brief-ul website-ului · LUNAR", html: templates.briefReminder(first(j), j.kind === "brief_reminder_2") };
    case "free_month":
      return { subject: "Am întârziat lansarea: următoarea lună e gratuită · LUNAR", html: templates.freeMonth(first(j), j.number!, date(j.due), j.domain ?? null) };
    case "overdue_1":
    case "overdue_5":
    case "overdue_10":
      return { subject: `Rata ${j.number} din 12 este restantă · LUNAR`, html: templates.overdue(first(j), j.number!, amt, j.reference!, j.iban!, date(j.due), j.kind === "overdue_10") };
  }
  return null;
}

/** Automatizări zilnice (07:30). Apelat de pg_cron cu Authorization: Bearer CRON_SECRET. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const key = process.env.RESEND_API_KEY;
  const db = createAnon(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await rpcRetry(() => db.rpc("daily_automation", { p_secret: secret }));
  if (error) { reportError("cron-daily", error); return NextResponse.json({ error: error.message }, { status: 500 }); }

  const resend = key ? new Resend(key) : null;
  const stats: Record<string, number> = {};
  for (const j of (data ?? []) as Job[]) {
    const mail = render(j);
    if (!mail || !resend) continue;
    const { data: res, error: e } = await resend.emails.send({ from: process.env.EMAIL_FROM || "LUNAR <hello@golunar.ro>", to: j.to, replyTo: "hello@golunar.ro", subject: mail.subject, html: mail.html });
    await db.rpc("log_cron_email", { p_secret: secret, p_company: j.company_id, p_template: j.kind, p_to: j.to, p_resend_id: res?.id ?? null, p_period: e ? null : j.period, p_status: e ? "failed" : "sent" });
    stats[j.kind] = (stats[j.kind] ?? 0) + (e ? 0 : 1);
  }
  return NextResponse.json({ ok: true, sent: stats });
}
