import "server-only";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/env";

const FROM = process.env.EMAIL_FROM || "LUNAR <hello@golunar.ro>";
const FROM_BILLING = process.env.EMAIL_BILLING_FROM || "LUNAR <hello@golunar.ro>";

type Send = {
  template: string;
  to: string;
  subject: string;
  html: string;
  billing?: boolean;
  companyId?: string | null;
  db?: SupabaseClient | null;
  replyTo?: string;
};

/** Sends via Resend and logs to email_log. Never throws: email must not break payments. */
export async function sendEmail({ template, to, subject, html, billing, companyId, db, replyTo }: Send) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY missing, skipped ${template} → ${to}`);
    return null;
  }
  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from: billing ? FROM_BILLING : FROM,
      to,
      subject,
      html,
      replyTo: replyTo || "hello@golunar.ro",
    });
    if (error) throw new Error(error.message);
    await db?.from("email_log").insert({ company_id: companyId ?? null, template, to_email: to, resend_id: data?.id ?? null, status: "sent" });
    return data?.id ?? null;
  } catch (e) {
    console.error(`[email] ${template} failed`, e);
    await db?.from("email_log").insert({ company_id: companyId ?? null, template, to_email: to, status: "failed" });
    return null;
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Single-CTA transactional layout. Light background for deliverability and dark-mode safety. */
export function layout({ preheader, title, body, cta, ctaUrl }: { preheader: string; title: string; body: string; cta?: string; ctaUrl?: string }) {
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;background:#EEEEEF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0B0B0C">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEEEEF;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:20px;overflow:hidden">
<tr><td style="padding:28px 32px 0"><span style="font-weight:700;font-size:20px;letter-spacing:-.04em">● LUNAR</span></td></tr>
<tr><td style="padding:24px 32px 8px"><h1 style="margin:0 0 12px;font-size:26px;line-height:1.15;font-weight:600;letter-spacing:-.03em">${esc(title)}</h1>
<div style="font-size:15px;line-height:1.6;color:#3F3F46">${body}</div></td></tr>
${cta && ctaUrl ? `<tr><td style="padding:16px 32px 8px"><a href="${ctaUrl}" style="display:inline-block;background:#FF5B1F;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:999px">${esc(cta)}</a></td></tr>` : ""}
<tr><td style="padding:24px 32px 28px;font-size:12px;color:#6B6B72;line-height:1.5">LUNAR · golunar.ro · Website-ul tău, mai bun lună de lună.<br>Ai primit acest email pentru că ai un cont LUNAR.</td></tr>
</table></td></tr></table></body></html>`;
}

export const templates = {
  welcome: (name: string) =>
    layout({
      preheader: "Contul tău LUNAR e gata. Următorul pas: brief-ul de 5 minute.",
      title: `Bun venit, ${name}`,
      body: `<p>Abonamentul este activ. Ceasul de 10 zile lucrătoare pornește când completezi brief-ul.</p><p>Te autentifici în portal cu adresa de email pe care ai folosit-o la comandă, fără parolă.</p>`,
      cta: "Intră în portal",
      ctaUrl: `${SITE_URL}/login`,
    }),
  bankOrder: (name: string, amount: string, reference: string, iban: string) =>
    layout({
      preheader: `Proforma pentru prima rată: ${amount}. Referință ${reference}.`,
      title: "Comanda ta a fost înregistrată",
      body: `<p>Mulțumim, ${esc(name)}. Pentru a porni lansarea, plătește prima rată prin transfer bancar.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0"><tr><td style="padding:6px 0;color:#6B6B72">Sumă</td><td align="right"><b>${esc(amount)}</b></td></tr>
<tr><td style="padding:6px 0;color:#6B6B72">IBAN</td><td align="right"><b>${esc(iban || "îl primești de la noi în cel mult o zi lucrătoare")}</b></td></tr>
<tr><td style="padding:6px 0;color:#6B6B72">Referință obligatorie</td><td align="right"><b>${esc(reference)}</b></td></tr></table>
<p>Confirmăm plata automat în 1–2 zile lucrătoare și emitem factura fiscală în SPV.</p>`,
      cta: "Vezi comanda în portal",
      ctaUrl: `${SITE_URL}/login`,
    }),
  paymentFailed: (amount: string) =>
    layout({
      preheader: "Plata lunară nu a trecut. Actualizează cardul în 1 minut.",
      title: "Plata nu a putut fi procesată",
      body: `<p>Am încercat să debităm <b>${esc(amount)}</b>, dar banca a refuzat tranzacția. Reîncercăm automat de 3 ori în 7 zile.</p><p>Ca să eviți suspendarea site-ului după 14 zile, actualizează metoda de plată.</p>`,
      cta: "Actualizează cardul",
      ctaUrl: `${SITE_URL}/cont/metode`,
    }),
  paymentOk: (amount: string, number: number) =>
    layout({
      preheader: `Rata ${number} din 12 a fost încasată.`,
      title: `Rata ${number} din 12 încasată`,
      body: `<p>Am încasat <b>${esc(amount)}</b>. Factura fiscală este emisă în SPV și disponibilă în portal.</p>${number >= 10 && number < 12 ? `<p>Mai ai ${12 - number} ${12 - number === 1 ? "rată" : "rate"} până când website-ul devine al tău.</p>` : ""}${number === 12 ? "<p>Felicitări: website-ul este acum al tău. Îți trimitem procesul-verbal de transfer.</p>" : ""}`,
      cta: "Vezi facturile",
      ctaUrl: `${SITE_URL}/cont/plati`,
    }),
  requestReceived: (title: string) =>
    layout({
      preheader: "Am primit cererea ta. Răspundem în maximum 48 de ore lucrătoare.",
      title: "Am primit cererea",
      body: `<p><b>${esc(title)}</b></p><p>Răspundem în maximum 48 de ore lucrătoare. Urmărești statusul în portal.</p>`,
      cta: "Vezi cererile",
      ctaUrl: `${SITE_URL}/cont/cereri`,
    }),
  adminNotice: (title: string, rows: Record<string, string | undefined | null>) =>
    layout({
      preheader: title,
      title,
      body: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">${Object.entries(rows)
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6B6B72;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(String(v))}</td></tr>`)
        .join("")}</table>`,
      cta: "Deschide admin",
      ctaUrl: `${SITE_URL}/admin`,
    }),
};
