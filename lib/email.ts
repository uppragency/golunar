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

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";

/** Branded dark layout (same design as the Supabase auth emails). Single CTA. */
export function layout({ preheader, title, titleDim, eyebrow = "LUNAR", body, cta, ctaUrl }: { preheader: string; title: string; titleDim?: string; eyebrow?: string; body: string; cta?: string; ctaUrl?: string }) {
  const btn = cta && ctaUrl
    ? `<tr><td class="px" style="padding:8px 40px 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#FF5B1F" style="border-radius:999px;background:#FF5B1F"><a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:8px 26px 8px 8px;font-family:${FONT};font-size:15px;font-weight:600;line-height:20px;color:#FFFFFF;text-decoration:none;border-radius:999px"><span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;border-radius:50%;background:#FFFFFF;color:#FF5B1F;font-size:17px;vertical-align:middle;margin-right:12px">&rarr;</span><span style="vertical-align:middle">${esc(cta)}</span></a></td></tr></table></td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(title)}</title>
<style>:root{color-scheme:dark;supported-color-schemes:dark} body{margin:0;padding:0} a{color:#FF7A45} @media (max-width:600px){.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:28px!important;line-height:32px!important}}</style></head>
<body style="margin:0;padding:0;background:#0B0B0C" bgcolor="#0B0B0C">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0B0B0C">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B0B0C" style="background:#0B0B0C;background-image:radial-gradient(60% 40% at 50% 0%,rgba(255,91,31,.16),transparent 70%)"><tr><td align="center" style="padding:40px 14px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td style="padding:0 8px 22px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle"><img src="https://golunar.ro/email/mark.png" width="20" height="20" alt="" style="display:block;border:0;border-radius:50%"></td><td valign="middle" style="padding-left:9px;font-family:${FONT};font-size:20px;font-weight:700;letter-spacing:-0.8px;color:#F5F5F6">LUNAR</td></tr></table></td></tr>
<tr><td bgcolor="#18181B" style="background:#18181B;background-image:linear-gradient(160deg,#1F1F23,#18181B);border:1px solid #27272A;border-radius:28px;overflow:hidden"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td height="4" bgcolor="#FF5B1F" style="height:4px;line-height:4px;font-size:0;background:#FF5B1F;background-image:linear-gradient(90deg,#FF5B1F,#FF7A45,#FFB08A)">&nbsp;</td></tr>
<tr><td class="px" style="padding:36px 40px 0"><p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C8C93"><span style="color:#FF5B1F">&#9679;</span>&nbsp; ${esc(eyebrow)}</p>
<h1 class="h1" style="margin:16px 0 0;font-family:${FONT};font-size:34px;line-height:38px;font-weight:600;letter-spacing:-1.2px;color:#F5F5F6">${esc(title)}${titleDim ? `<br><span style="color:#5E5E65">${esc(titleDim)}</span>` : ""}</h1>
<div style="margin:18px 0 24px;font-family:${FONT};font-size:15px;line-height:24px;color:#C4C4CA">${body}</div></td></tr>
${btn}
<tr><td class="px" style="padding:28px 40px 36px"><p style="margin:0;font-family:${FONT};font-size:13px;line-height:20px;color:#5E5E65">Ai primit acest email pentru că ai un cont LUNAR. Întrebări? Răspunde direct la acest email.</p></td></tr>
</table></td></tr>
<tr><td style="padding:26px 8px 0;font-family:${FONT};font-size:13px;line-height:20px;color:#8C8C93"><p style="margin:0;color:#F5F5F6">Website-ul tău, mai bun lună de lună.</p><p style="margin:6px 0 0"><a href="https://golunar.ro" style="color:#8C8C93;text-decoration:none">golunar.ro</a> &nbsp;·&nbsp; <a href="mailto:hello@golunar.ro" style="color:#8C8C93;text-decoration:none">hello@golunar.ro</a></p></td></tr>
<tr><td style="padding:22px 4px 0;font-family:${FONT};font-size:96px;line-height:80px;font-weight:700;letter-spacing:-6px;color:#17171A;white-space:nowrap" aria-hidden="true">GO LUNAR</td></tr>
</table></td></tr></table></body></html>`;
}

export const templates = {
  welcome: (name: string) =>
    layout({
      preheader: "Contul tău LUNAR e gata. Următorul pas: brief-ul de 5 minute.",
      eyebrow: "Bun venit",
      title: `Bun venit, ${name}.`,
      titleDim: "Următorul pas: brief-ul.",
      body: `<p>Abonamentul este activ. Ceasul de 10 zile lucrătoare pornește când completezi brief-ul.</p><p>Te autentifici în portal cu adresa de email pe care ai folosit-o la comandă, fără parolă.</p>`,
      cta: "Intră în portal",
      ctaUrl: `${SITE_URL}/login`,
    }),
  bankOrder: (name: string, amount: string, reference: string, iban: string) =>
    layout({
      preheader: `Proforma pentru prima rată: ${amount}. Referință ${reference}.`,
      eyebrow: "Comandă",
      title: "Comanda e înregistrată.",
      titleDim: "Plătești prin transfer.",
      body: `<p>Mulțumim, ${esc(name)}. Pentru a porni lansarea, plătește prima rată prin transfer bancar.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0"><tr><td style="padding:6px 0;color:#8C8C93">Sumă</td><td align="right"><b style="color:#F5F5F6">${esc(amount)}</b></td></tr>
<tr><td style="padding:6px 0;color:#8C8C93">IBAN</td><td align="right"><b>${esc(iban || "îl primești de la noi în cel mult o zi lucrătoare")}</b></td></tr>
<tr><td style="padding:6px 0;color:#8C8C93">Referință obligatorie</td><td align="right"><b>${esc(reference)}</b></td></tr></table>
<p>Confirmăm plata automat în 1–2 zile lucrătoare și emitem factura fiscală în SPV.</p>`,
      cta: "Vezi comanda în portal",
      ctaUrl: `${SITE_URL}/login`,
    }),
  paymentFailed: (amount: string) =>
    layout({
      preheader: "Plata lunară nu a trecut. Actualizează cardul în 1 minut.",
      eyebrow: "Plată",
      title: "Plata nu a trecut.",
      titleDim: "Actualizează cardul.",
      body: `<p>Am încercat să debităm <b style="color:#F5F5F6">${esc(amount)}</b>, dar banca a refuzat tranzacția. Reîncercăm automat de 3 ori în 7 zile.</p><p>Ca să eviți suspendarea site-ului după 14 zile, actualizează metoda de plată.</p>`,
      cta: "Actualizează cardul",
      ctaUrl: `${SITE_URL}/cont/metode`,
    }),
  paymentOk: (amount: string, number: number) =>
    layout({
      preheader: `Rata ${number} din 12 a fost încasată.`,
      eyebrow: "Plată",
      title: `Rata ${number} din 12 încasată.`,
      titleDim: number >= 12 ? "Website-ul e al tău." : `Mai ai ${12 - number} până la proprietate.`,
      body: `<p>Am încasat <b style="color:#F5F5F6">${esc(amount)}</b>. Factura fiscală este emisă în SPV și disponibilă în portal.</p>${number >= 10 && number < 12 ? `<p>Mai ai ${12 - number} ${12 - number === 1 ? "rată" : "rate"} până când website-ul devine al tău.</p>` : ""}${number === 12 ? "<p>Felicitări: website-ul este acum al tău. Îți trimitem procesul-verbal de transfer.</p>" : ""}`,
      cta: "Vezi facturile",
      ctaUrl: `${SITE_URL}/cont/plati`,
    }),
  requestReceived: (title: string) =>
    layout({
      preheader: "Am primit cererea ta. Răspundem în maximum 48 de ore lucrătoare.",
      eyebrow: "Cerere",
      title: "Am primit cererea.",
      titleDim: "Răspundem în 48h lucrătoare.",
      body: `<p><b>${esc(title)}</b></p><p>Răspundem în maximum 48 de ore lucrătoare. Urmărești statusul în portal.</p>`,
      cta: "Vezi cererile",
      ctaUrl: `${SITE_URL}/cont/cereri`,
    }),
  adminNotice: (title: string, rows: Record<string, string | undefined | null>) =>
    layout({
      preheader: title,
      eyebrow: "Admin",
      title,
      body: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">${Object.entries(rows)
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#8C8C93;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(String(v))}</td></tr>`)
        .join("")}</table>`,
      cta: "Deschide admin",
      ctaUrl: `${SITE_URL}/admin`,
    }),
};
