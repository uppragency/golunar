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
  headers?: Record<string, string>;
};

/** Sends via Resend and logs to email_log. Never throws: email must not break payments. */
export async function sendEmail({ template, to, subject, html, billing, companyId, db, replyTo, headers }: Send) {
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
      ...(headers ? { headers } : {}),
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

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";

/** Branded dark layout (same design as the Supabase auth emails). Single CTA. */
export function layout({ preheader, title, titleDim, eyebrow = "LUNAR", body, cta, ctaUrl, foot }: { preheader: string; title: string; titleDim?: string; eyebrow?: string; body: string; cta?: string; ctaUrl?: string; foot?: string }) {
  const btn = cta && ctaUrl
    ? `<tr><td class="px" style="padding:8px 40px 4px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#FF5B1F" style="border-radius:999px;background:#FF5B1F"><a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:8px 26px 8px 8px;font-family:${FONT};font-size:15px;font-weight:600;line-height:20px;color:#FFFFFF;text-decoration:none;border-radius:999px"><span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;border-radius:50%;background:#FFFFFF;color:#FF5B1F;font-size:17px;vertical-align:middle;margin-right:12px">&rarr;</span><span style="vertical-align:middle">${esc(cta)}</span></a></td></tr></table></td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(title)}</title>
<style>:root{color-scheme:dark;supported-color-schemes:dark} body{margin:0;padding:0} a{color:#FF7A45} @media (max-width:600px){.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:28px!important;line-height:32px!important}}</style></head>
<body style="margin:0;padding:0;background:#0B0B0C" bgcolor="#0B0B0C">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0B0B0C">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B0B0C" style="background:#0B0B0C;background-image:radial-gradient(60% 40% at 50% 0%,rgba(255,91,31,.16),transparent 70%)"><tr><td align="center" style="padding:40px 14px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td style="padding:0 8px 22px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle"><img src="https://golunar.ro/email/mark.png" width="26" height="26" alt="LUNAR" style="display:block;border:0"></td><td valign="middle" style="padding-left:9px;font-family:${FONT};font-size:20px;font-weight:700;letter-spacing:-0.8px;color:#F5F5F6">LUNAR</td></tr></table></td></tr>
<tr><td bgcolor="#18181B" style="background:#18181B;background-image:linear-gradient(160deg,#1F1F23,#18181B);border:1px solid #27272A;border-radius:28px;overflow:hidden"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td height="4" bgcolor="#FF5B1F" style="height:4px;line-height:4px;font-size:0;background:#FF5B1F;background-image:linear-gradient(90deg,#FF5B1F,#FF7A45,#FFB08A)">&nbsp;</td></tr>
<tr><td class="px" style="padding:36px 40px 0"><p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C8C93"><span style="color:#FF5B1F">&#9679;</span>&nbsp; ${esc(eyebrow)}</p>
<h1 class="h1" style="margin:16px 0 0;font-family:${FONT};font-size:34px;line-height:38px;font-weight:600;letter-spacing:-1.2px;color:#F5F5F6">${esc(title)}${titleDim ? `<br><span style="color:#5E5E65">${esc(titleDim)}</span>` : ""}</h1>
<div style="margin:18px 0 24px;font-family:${FONT};font-size:15px;line-height:24px;color:#C4C4CA">${body}</div></td></tr>
${btn}
<tr><td class="px" style="padding:28px 40px 36px"><p style="margin:0;font-family:${FONT};font-size:13px;line-height:20px;color:#5E5E65">${foot ?? "Ai primit acest email pentru că ai un cont LUNAR. Întrebări? Răspunde direct la acest email."}</p></td></tr>
</table></td></tr>
<tr><td style="padding:26px 8px 0;font-family:${FONT};font-size:13px;line-height:20px;color:#8C8C93"><p style="margin:0;color:#F5F5F6">Website-ul tău, mai bun lună de lună.</p><p style="margin:6px 0 0"><a href="https://golunar.ro" style="color:#8C8C93;text-decoration:none">golunar.ro</a> &nbsp;·&nbsp; <a href="mailto:hello@golunar.ro" style="color:#8C8C93;text-decoration:none">hello@golunar.ro</a></p></td></tr>
<tr><td style="padding:22px 4px 0;font-family:${FONT};font-size:96px;line-height:80px;font-weight:700;letter-spacing:-6px;color:#17171A;white-space:nowrap" aria-hidden="true">GO LUNAR</td></tr>
</table></td></tr></table></body></html>`;
}

const row = (k: string, v: string, sub = "") => `<tr><td style="padding:9px 0;border-top:1px solid #232327;color:#8C8C93">${esc(k)}</td><td align="right" style="padding:9px 0;border-top:1px solid #232327;color:#F5F5F6;font-weight:500">${v}${sub ? ` <span style="color:#8C8C93;font-weight:400">${sub}</span>` : ""}</td></tr>`;
const tbl = (rows: string) => `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:6px 0 4px">${rows}</table>`;
const delta = (a?: number | null, b?: number | null) => (a != null && b ? `${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%` : "");

export type MonthlyReport = {
  monthLabel: string; name: string; domain?: string | null; uptime?: number | null;
  cur?: { visitors: number; leads: number; pos: number | null; calls: number | null } | null;
  prev?: { visitors: number; leads: number; pos: number | null; calls: number | null } | null;
  delivered: { title: string; date: string }[]; paid: number; ownerLabel: string; refLink: string;
};

export function monthlyReport(r: MonthlyReport) {
  const n = (v: number) => v.toLocaleString("ro-RO");
  const metrics = r.cur
    ? tbl(row("Vizitatori", n(r.cur.visitors), delta(r.cur.visitors, r.prev?.visitors)) + row("Cereri din formular", n(r.cur.leads), delta(r.cur.leads, r.prev?.leads)) +
        (r.cur.pos != null ? row("Poziție medie Google", r.cur.pos.toLocaleString("ro-RO", { maximumFractionDigits: 1 })) : "") +
        (r.cur.calls != null ? row("Apeluri din Google Maps", n(r.cur.calls)) : "") +
        (r.uptime != null ? row("Disponibilitate (90 zile)", `${r.uptime.toLocaleString("ro-RO", { maximumFractionDigits: 2 })}%`) : ""))
    : `<p style="color:#8C8C93">Statisticile apar din prima lună completă după lansare.</p>`;
  const done = r.delivered.length
    ? `<ul style="margin:6px 0 0;padding-left:18px">${r.delivered.map((d) => `<li style="margin:4px 0">${esc(d.title)}</li>`).join("")}</ul>`
    : `<p style="color:#8C8C93;margin:6px 0 0">Nicio îmbunătățire cerută luna aceasta. Ai una sau mai multe incluse lunar: cere-o din portal.</p>`;
  const pct = Math.min(100, Math.round((Math.min(12, r.paid) / 12) * 100));
  return layout({
    preheader: `Raportul LUNAR pentru ${r.monthLabel}${r.domain ? ` · ${r.domain}` : ""}.`,
    eyebrow: `Raport · ${r.monthLabel}`,
    title: `Raportul lunii ${r.monthLabel}.`,
    titleDim: r.domain || undefined,
    body: `<p>Bună, ${esc(r.name)}. Iată ce a făcut website-ul tău luna trecută.</p>
<p style="margin:22px 0 0;font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5E5E65">Rezultate</p>${metrics}
<p style="margin:22px 0 0;font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5E5E65">Îmbunătățiri livrate</p>${done}
<p style="margin:22px 0 8px;font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5E5E65">Drumul spre proprietate</p>
<p style="margin:0 0 8px;color:#F5F5F6"><b>${Math.min(12, r.paid)} din 12 plăți</b> <span style="color:#8C8C93">· ${esc(r.ownerLabel)}</span></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#232327;border-radius:99px;height:8px;font-size:0;line-height:0"><table role="presentation" width="${pct}%" cellpadding="0" cellspacing="0"><tr><td style="background:#FF5B1F;border-radius:99px;height:8px;font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr></table>
<p style="margin:22px 0 0;color:#8C8C93;font-size:13px">Recomandă LUNAR și primești o lună gratuită pentru fiecare client nou: <a href="${r.refLink}" style="color:#FF7A45">${esc(r.refLink.replace(/^https?:\/\//, ""))}</a></p>`,
    cta: "Deschide portalul",
    ctaUrl: `${SITE_URL}/cont`,
  });
}

export type AuditEmail = { url: string; scores: { label: string; value: number | null }[]; issues: string[]; lcp?: string; cls?: string; tbt?: string };

export function auditReport(a: AuditEmail) {
  const color = (v: number | null) => (v == null ? "#8C8C93" : v >= 90 ? "#3DD68C" : v >= 50 ? "#FFB020" : "#FF5B5B");
  const cells = a.scores.map((s) => `<td align="center" style="padding:14px 6px;border:1px solid #232327;border-radius:14px"><div style="font-family:${FONT};font-size:28px;font-weight:600;color:${color(s.value)}">${s.value ?? "—"}</div><div style="font-family:${MONO};font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8C8C93;margin-top:4px">${esc(s.label)}</div></td>`).join('<td width="6"></td>');
  const issues = a.issues.length ? `<ul style="margin:6px 0 0;padding-left:18px">${a.issues.map((i) => `<li style="margin:5px 0">${esc(i)}</li>`).join("")}</ul>` : `<p style="color:#8C8C93">Nicio problemă majoră detectată automat.</p>`;
  return layout({
    preheader: `Auditul gratuit pentru ${a.url}: scoruri și ce merită reparat întâi.`,
    eyebrow: "Audit gratuit",
    title: "Auditul site-ului tău.",
    titleDim: a.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    body: `<p>Am testat versiunea pentru mobil, cea pe care o văd majoritatea clienților tăi.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0"><tr>${cells}</tr></table>
${tbl((a.lcp ? row("Încărcarea conținutului principal (LCP)", esc(a.lcp)) : "") + (a.tbt ? row("Timp de blocare (TBT)", esc(a.tbt)) : "") + (a.cls ? row("Stabilitate vizuală (CLS)", esc(a.cls)) : ""))}
<p style="margin:22px 0 0;font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5E5E65">Ce aș repara întâi</p>${issues}
<p style="margin:22px 0 0">Vrei să discutăm rezultatele? O discuție de 20 de minute, gratuită, fără obligații.</p>`,
    cta: "Programează discuția",
    ctaUrl: `${SITE_URL}/?discutie=1`,
  });
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
  bankOrder: (name: string, amount: string, reference: string, iban: string, email = "") =>
    layout({
      preheader: `Comanda ${reference}: de plată ${amount} prin transfer bancar.`,
      eyebrow: "Comandă",
      title: `Comanda ${reference} e înregistrată.`,
      titleDim: `De plată: ${amount}.`,
      body: `<p>Mulțumim, ${esc(name)}. Pentru a porni lansarea, plătește prima rată prin transfer bancar, din aplicația băncii tale.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
<tr><td style="padding:7px 0;color:#8C8C93">Beneficiar</td><td align="right"><b style="color:#F5F5F6">UPPRMARKETING S.R.L.</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">IBAN</td><td align="right"><b style="color:#F5F5F6;font-family:${MONO}">${esc(iban)}</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">Banca</td><td align="right"><b style="color:#F5F5F6">BANCA TRANSILVANIA</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">Suma</td><td align="right"><b style="color:#F5F5F6">${esc(amount)}</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">Detalii plată</td><td align="right"><b style="color:#FF7A45;font-family:${MONO}">Comanda ${esc(reference)}</b></td></tr></table>
<p>Pașii următori:</p>
<ol style="margin:6px 0 0;padding-left:18px"><li style="margin:4px 0">Plătești prima rată cu referința de mai sus.</li><li style="margin:4px 0">Îți creezi parola contului de client, cu acest email.</li><li style="margin:4px 0">Confirmăm plata, de obicei în aceeași zi lucrătoare, și primești acces complet.</li><li style="margin:4px 0">Completezi brief-ul din cont. Lansăm în 10 zile lucrătoare.</li></ol>
<p style="margin-top:16px;color:#8C8C93;font-size:12px">Facturile sunt emise de UPPRMARKETING S.R.L., CIF 52762670, J2025081624004.</p>`,
      cta: "Creează parola contului",
      ctaUrl: `${SITE_URL}/login?mode=signup${email ? `&email=${encodeURIComponent(email)}` : ""}`,
    }),
  orderReminder: (name: string, amount: string, reference: string, iban: string, daysLeft: number, last: boolean) =>
    layout({
      preheader: `Comanda ${reference} așteaptă plata: ${amount}.`,
      eyebrow: "Comandă",
      title: last ? `Comanda ${reference} expiră în ${daysLeft} ${daysLeft === 1 ? "zi" : "zile"}.` : `Comanda ${reference} așteaptă plata.`,
      titleDim: `De plată: ${amount}.`,
      body: `<p>Bună, ${esc(name)}. Nu am primit încă plata primei rate. Website-ul intră în lucru imediat ce confirmăm transferul.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
<tr><td style="padding:7px 0;color:#8C8C93">Beneficiar</td><td align="right"><b style="color:#F5F5F6">UPPRMARKETING S.R.L.</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">IBAN</td><td align="right"><b style="color:#F5F5F6;font-family:${MONO}">${esc(iban)}</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">Suma</td><td align="right"><b style="color:#F5F5F6">${esc(amount)}</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">Detalii plată</td><td align="right"><b style="color:#FF7A45;font-family:${MONO}">Comanda ${esc(reference)}</b></td></tr></table>
<p>${last ? "Dacă nu primim plata, comanda se anulează automat. Poți plasa oricând una nouă." : "Ai întrebări? Răspunde la acest email."}</p>`,
      cta: "Vezi datele de plată",
      ctaUrl: `${SITE_URL}/cont`,
    }),
  orderExpired: (name: string, reference: string) =>
    layout({
      preheader: `Comanda ${reference} a fost anulată.`,
      eyebrow: "Comandă",
      title: `Comanda ${reference} a expirat.`,
      titleDim: "Nu ai nimic de plătit.",
      body: `<p>Bună, ${esc(name)}. Nu am primit plata în 10 zile, așa că am anulat comanda. Dacă vrei în continuare website-ul, plasezi o comandă nouă în 2 minute.</p>`,
      cta: "Comandă din nou",
      ctaUrl: `${SITE_URL}/?comanda=1`,
    }),
  briefReminder: (name: string, second: boolean) =>
    layout({
      preheader: "Completează brief-ul ca să pornim lansarea în 10 zile lucrătoare.",
      eyebrow: "Brief",
      title: second ? "Website-ul tău așteaptă brief-ul." : "Un pas până pornim lucrul.",
      titleDim: "Durează 5 minute.",
      body: `<p>Bună, ${esc(name)}. Plata e confirmată, dar nu am primit încă brief-ul. Termenul de 10 zile lucrătoare pornește din ziua în care îl trimiți.</p><p>Ai nevoie de ajutor? Răspunde la acest email și îl completăm împreună la telefon.</p>`,
      cta: "Completează brief-ul",
      ctaUrl: `${SITE_URL}/cont/brief`,
    }),
  freeMonth: (name: string, number: number, due: string, domain: string | null) =>
    layout({
      preheader: "Am întârziat lansarea. Următoarea lună e gratuită.",
      eyebrow: "Garanție",
      title: "Am întârziat lansarea.",
      titleDim: "Următoarea lună e gratuită.",
      body: `<p>Bună, ${esc(name)}. Ne-am angajat la 10 zile lucrătoare${domain ? ` pentru ${esc(domain)}` : ""} și am depășit termenul. Conform garanției, <b style="color:#F5F5F6">rata ${number}, scadentă pe ${esc(due)}, este 0 lei</b>.</p><p>Lucrăm în continuare și te anunțăm imediat ce website-ul e online.</p>`,
      cta: "Vezi plățile",
      ctaUrl: `${SITE_URL}/cont/plati`,
    }),
  overdue: (name: string, number: number, amount: string, reference: string, iban: string, due: string, last: boolean) =>
    layout({
      preheader: `Rata ${number} (${amount}) era scadentă pe ${due}.`,
      eyebrow: "Plată",
      title: `Rata ${number} din 12 este restantă.`,
      titleDim: `De plată: ${amount}.`,
      body: `<p>Bună, ${esc(name)}. Rata ${number}, scadentă pe ${esc(due)}, nu a fost încă încasată. Dacă ai plătit deja, ignoră acest mesaj.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:12px 0">
<tr><td style="padding:7px 0;color:#8C8C93">Beneficiar</td><td align="right"><b style="color:#F5F5F6">UPPRMARKETING S.R.L.</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">IBAN</td><td align="right"><b style="color:#F5F5F6;font-family:${MONO}">${esc(iban)}</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">Suma</td><td align="right"><b style="color:#F5F5F6">${esc(amount)}</b></td></tr>
<tr><td style="padding:7px 0;color:#8C8C93">Detalii plată</td><td align="right"><b style="color:#FF7A45;font-family:${MONO}">${esc(reference)} rata ${number}</b></td></tr></table>
<p>${last ? "Fără plată, website-ul poate fi suspendat temporar. Scrie-ne dacă ai nevoie de câteva zile în plus." : "Ai întrebări? Răspunde la acest email."}</p>`,
      cta: "Vezi plățile",
      ctaUrl: `${SITE_URL}/cont/plati`,
    }),
  upgradeOffer: (name: string, from: string, to: string, used: number, incl: number, toImpr: number) =>
    layout({
      preheader: `Ceri mai multe îmbunătățiri decât include planul ${from}.`,
      eyebrow: "Abonament",
      title: "Website-ul tău crește.",
      titleDim: `Planul ${to} ți se potrivește mai bine.`,
      body: `<p>Bună, ${esc(name)}. Luna aceasta ai cerut ${used} îmbunătățiri, iar planul ${esc(from)} include ${incl}. Pe planul <b style="color:#F5F5F6">${esc(to)}</b> ai ${toImpr} îmbunătățiri pe lună, plus funcțiile planului.</p><p>Schimbarea se face de la următoarea rată, fără costuri suplimentare. Răspunde la acest email și o activăm.</p>`,
      cta: "Vezi planurile",
      ctaUrl: `${SITE_URL}/#abonamente`,
    }),
  leadOffer: (name: string, plan: string, percent: number, months: number, url: string, code: string) =>
    layout({
      preheader: `Ofertă personală: ${percent}% reducere la planul ${plan}, valabilă 72 de ore.`,
      eyebrow: "Ofertă personală",
      title: `${percent}% reducere la planul ${plan}.`,
      titleDim: "Valabilă 72 de ore.",
      body: `<p>Bună, ${esc(name)}. Mulțumim pentru interes. Am pregătit pentru tine o ofertă: <b style="color:#F5F5F6">${percent}% reducere ${months === 1 ? "în prima lună" : `în primele ${months} luni`}</b> la planul ${esc(plan)}.</p><p>Codul <b style="color:#FF7A45;font-family:${MONO}">${esc(code)}</b> este deja aplicat în link. Expiră în 72 de ore.</p>`,
      cta: "Comandă cu reducerea",
      ctaUrl: url,
    }),
  broadcast: (subject: string, body: string) =>
    layout({
      preheader: body.slice(0, 120),
      eyebrow: "Noutăți LUNAR",
      title: subject,
      body: body.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join(""),
      cta: "Intră în portal",
      ctaUrl: `${SITE_URL}/cont`,
    }),
  briefReceived: (name: string, due: string) =>
    layout({
      preheader: `Am primit brief-ul. Lansarea e programată până pe ${due}.`,
      eyebrow: "Brief primit",
      title: "Am primit brief-ul.",
      titleDim: `Lansare până pe ${due}.`,
      body: `<p>Mulțumim, ${esc(name)}. Ceasul de 10 zile lucrătoare a pornit. Următorul pas: îți trimitem propunerea de design spre aprobare, direct în portal.</p><p>Dacă ne lipsește ceva, te contactăm noi.</p>`,
      cta: "Vezi progresul",
      ctaUrl: `${SITE_URL}/cont`,
    }),
  designReady: (name: string) =>
    layout({
      preheader: "Designul website-ului tău e gata. Aprobă-l sau cere ajustări din portal.",
      eyebrow: "Design",
      title: "Designul e gata.",
      titleDim: "Spune-ne ce crezi.",
      body: `<p>Bună, ${esc(name)}. Propunerea de design te așteaptă în portal. O aprobi dintr-un click sau scrii ce ai vrea să schimbăm.</p><p>Aprobarea pornește dezvoltarea.</p>`,
      cta: "Vezi designul",
      ctaUrl: `${SITE_URL}/cont`,
    }),
  siteLive: (name: string, domain: string) =>
    layout({
      preheader: `${domain} este online.`,
      eyebrow: "Lansare",
      title: "Website-ul tău e online.",
      titleDim: domain,
      body: `<p>Felicitări, ${esc(name)}! <b style="color:#F5F5F6">${esc(domain)}</b> este live. De acum îl monitorizăm la fiecare 10 minute și îl îmbunătățim lunar.</p><p>Ai o idee de îmbunătățire? O trimiți din portal.</p>`,
      cta: `Deschide ${domain}`,
      ctaUrl: `https://${domain}`,
    }),
  anniversary: (name: string, months: number, domain: string | null) =>
    layout({
      preheader: `${months === 12 ? "Un an" : "Șase luni"} împreună. Mulțumim!`,
      eyebrow: months === 12 ? "Un an împreună" : "Șase luni împreună",
      title: `Mulțumim pentru ${months === 12 ? "primul an" : "primele 6 luni"}.`,
      titleDim: "Continuăm să-l facem mai bun.",
      body: `<p>Bună, ${esc(name)}. Azi se împlinesc ${months} luni de când lucrăm împreună${domain ? ` la ${esc(domain)}` : ""}. Îți mulțumim pentru încredere.</p><p>${months === 12 ? "Website-ul este acum al tău. Îți trimitem separat procesul-verbal de predare." : "Ai o idee pentru site? Trimite-o din portal: îmbunătățirile lunare sunt incluse în abonament."}</p>`,
      cta: "Intră în portal",
      ctaUrl: `${SITE_URL}/cont`,
    }),
  handover: (name: string, domain: string | null) =>
    layout({
      preheader: "Website-ul este acum al tău. Procesul-verbal de predare e în portal.",
      eyebrow: "Proprietate",
      title: "Website-ul este al tău.",
      titleDim: domain ?? "",
      body: `<p>Felicitări, ${esc(name)}! Ai finalizat cele 12 plăți, iar website-ul${domain ? ` ${esc(domain)}` : ""} este acum proprietatea firmei tale.</p><p>În portal găsești procesul-verbal de predare. Codul-sursă și fișierele le primești la cerere, în cel mult 15 zile lucrătoare. Poți continua cu LUNAR pentru găzduire, mentenanță și îmbunătățiri.</p>`,
      cta: "Vezi procesul-verbal",
      ctaUrl: `${SITE_URL}/cont/predare`,
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
      body: `<p>Am încasat <b style="color:#F5F5F6">${esc(amount)}</b>. Factura fiscală este emisă în SPV și disponibilă în portal.</p>${number >= 10 && number < 12 ? `<p>Mai ai ${12 - number} ${12 - number === 1 ? "rată" : "rate"} până când website-ul devine al tău.</p>` : ""}${number === 12 ? "<p>Felicitări: website-ul este acum al tău. Îți trimitem procesul-verbal de transfer.</p>" : ""}${number === 1 ? "<p><b style=\"color:#F5F5F6\">Contul tău de client este acum activ.</b> Pasul următor: completează brief-ul, ca să pornim lansarea în 10 zile lucrătoare.</p>" : ""}`,
      cta: number === 1 ? "Completează brief-ul" : "Vezi facturile",
      ctaUrl: number === 1 ? `${SITE_URL}/cont/brief` : `${SITE_URL}/cont/plati`,
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
