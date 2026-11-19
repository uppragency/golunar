import "server-only";

export type AuditCheck = { id: string; label: string; ok: boolean; detail?: string; weight: number };
export type AuditResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  psi: boolean;
  scores: { performance: number | null; seo: number | null; accessibility: number | null; bestPractices: number | null };
  metrics: { lcp?: string; cls?: string; tbt?: string; fcp?: string; ttfbMs?: number; htmlKb?: number };
  checks: AuditCheck[];
  opportunities: string[];
  screenshot: string | null;
};

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 LUNAR-Audit/1.0";

/** Normalizează și validează un URL public (http/https, fără IP-uri private sau localhost). */
export function normalizeUrl(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    const h = u.hostname.toLowerCase();
    if (!h.includes(".") || h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return null;
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(h) || h.includes(":")) return null; // fără IP-uri directe
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

const pick = (html: string, re: RegExp) => re.exec(html)?.[1]?.trim() ?? null;
const strip = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** Verificări proprii pe HTML-ul paginii: rulează mereu, nu depind de Google. */
async function htmlChecks(url: string) {
  const t0 = Date.now();
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(15000), cache: "no-store" });
  const ttfbMs = Date.now() - t0;
  const html = (await res.text()).slice(0, 2_000_000);
  const finalUrl = res.url || url;
  const head = html.slice(0, html.search(/<\/head>/i) > 0 ? html.search(/<\/head>/i) : 60000);
  const title = pick(head, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = pick(head, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) ?? pick(head, /<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(head);
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(head);
  const lang = pick(html.slice(0, 2000), /<html[^>]*\slang=["']([^"']+)["']/i);
  const og = /<meta[^>]+property=["']og:(title|image)["']/i.test(head);
  const schema = /application\/ld\+json/i.test(html);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1])).filter(Boolean);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((i) => !/\salt=["'][^"']+["']/i.test(i)).length;
  const https = finalUrl.startsWith("https://");
  const noindex = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(head);
  const htmlKb = Math.round(Buffer.byteLength(html) / 1024);
  const words = strip(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")).split(" ").length;

  const checks: AuditCheck[] = [
    { id: "https", label: "Conexiune securizată (HTTPS)", ok: https, weight: 3, detail: https ? undefined : "Site-ul se deschide fără HTTPS. Google și browserele îl marchează ca nesigur." },
    { id: "status", label: "Pagina răspunde corect", ok: res.ok, weight: 3, detail: res.ok ? undefined : `Serverul a răspuns cu codul ${res.status}.` },
    { id: "speed", label: "Răspuns rapid al serverului", ok: ttfbMs < 800, weight: 2, detail: `Primul răspuns în ${ttfbMs} ms${ttfbMs >= 800 ? ". Ținta: sub 800 ms." : "."}` },
    { id: "viewport", label: "Adaptat pentru mobil", ok: viewport, weight: 3, detail: viewport ? undefined : "Lipsește eticheta viewport: pe telefon pagina apare micșorată." },
    { id: "title", label: "Titlu de pagină pentru Google", ok: !!title && title.length >= 15 && title.length <= 65, weight: 2, detail: title ? `„${title.slice(0, 80)}” · ${title.length} caractere (ideal 30–60).` : "Pagina nu are titlu." },
    { id: "desc", label: "Descriere pentru rezultatele Google", ok: !!desc && desc.length >= 70 && desc.length <= 170, weight: 2, detail: desc ? `${desc.length} caractere (ideal 120–160).` : "Lipsește meta description: Google alege singur un text, de obicei nepotrivit." },
    { id: "h1", label: "Un singur titlu principal (H1)", ok: h1s.length === 1, weight: 1, detail: h1s.length === 0 ? "Pagina nu are H1." : h1s.length > 1 ? `Pagina are ${h1s.length} titluri H1.` : `„${h1s[0].slice(0, 70)}”` },
    { id: "lang", label: "Limba paginii declarată", ok: !!lang, weight: 1, detail: lang ? `lang="${lang}"` : "Lipsește atributul lang." },
    { id: "canonical", label: "URL canonic", ok: canonical, weight: 1, detail: canonical ? undefined : "Fără canonical, Google poate indexa duplicate ale paginii." },
    { id: "og", label: "Previzualizare la distribuire (Open Graph)", ok: og, weight: 1, detail: og ? undefined : "Când cineva trimite linkul pe WhatsApp sau Facebook, nu apare imagine și titlu." },
    { id: "schema", label: "Date structurate (Schema.org)", ok: schema, weight: 1, detail: schema ? undefined : "Fără date structurate, Google și asistenții AI înțeleg mai greu ce oferi." },
    { id: "alt", label: "Imagini cu text alternativ", ok: noAlt === 0, weight: 1, detail: imgs.length ? `${imgs.length - noAlt} din ${imgs.length} imagini au alt.` : "Nicio imagine în HTML-ul inițial." },
    { id: "index", label: "Pagina poate fi indexată", ok: !noindex, weight: 3, detail: noindex ? "Pagina are noindex: nu apare în Google." : undefined },
    { id: "content", label: "Conținut suficient pe pagină", ok: words >= 250, weight: 1, detail: `Aproximativ ${words} cuvinte vizibile.` },
  ];
  return { finalUrl, ttfbMs, htmlKb, checks };
}

type Lh = {
  categories?: Record<string, { score: number | null }>;
  audits?: Record<string, { score: number | null; title?: string; displayValue?: string; details?: { type?: string; data?: string; overallSavingsMs?: number } }>;
};

async function pageSpeed(url: string): Promise<Lh | null> {
  const q = new URLSearchParams({ url, strategy: "mobile", locale: "ro" });
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) q.append("category", c);
  if (process.env.PAGESPEED_API_KEY) q.set("key", process.env.PAGESPEED_API_KEY);
  try {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: AbortSignal.timeout(50000), cache: "no-store" });
    if (!r.ok) {
      console.warn("[audit] pagespeed", r.status);
      return null;
    }
    return ((await r.json()) as { lighthouseResult?: Lh }).lighthouseResult ?? null;
  } catch (e) {
    console.warn("[audit] pagespeed failed", e);
    return null;
  }
}

const pct = (v: number | null | undefined) => (v == null ? null : Math.round(v * 100));

export async function runAudit(url: string): Promise<AuditResult> {
  const [lh, own] = await Promise.all([pageSpeed(url), htmlChecks(url)]);
  const a = lh?.audits ?? {};
  const opportunities = Object.values(a)
    .filter((x) => x.details?.type === "opportunity" && (x.score ?? 1) < 0.9 && (x.details.overallSavingsMs ?? 0) > 150)
    .sort((x, y) => (y.details?.overallSavingsMs ?? 0) - (x.details?.overallSavingsMs ?? 0))
    .slice(0, 5)
    .map((x) => `${x.title}${x.displayValue ? ` (${x.displayValue})` : ""}`);

  // Fără PageSpeed: scor SEO estimat din verificările proprii, marcat ca estimare în interfață.
  const seoChecks = own.checks.filter((c) => ["title", "desc", "h1", "lang", "canonical", "index", "viewport", "alt", "schema", "og"].includes(c.id));
  const est = Math.round((100 * seoChecks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0)) / seoChecks.reduce((s, c) => s + c.weight, 0));

  return {
    url,
    finalUrl: own.finalUrl,
    fetchedAt: new Date().toISOString(),
    psi: !!lh,
    scores: {
      performance: pct(lh?.categories?.performance?.score),
      seo: lh ? pct(lh.categories?.seo?.score) : est,
      accessibility: pct(lh?.categories?.accessibility?.score),
      bestPractices: pct(lh?.categories?.["best-practices"]?.score),
    },
    metrics: {
      lcp: a["largest-contentful-paint"]?.displayValue,
      cls: a["cumulative-layout-shift"]?.displayValue,
      tbt: a["total-blocking-time"]?.displayValue,
      fcp: a["first-contentful-paint"]?.displayValue,
      ttfbMs: own.ttfbMs,
      htmlKb: own.htmlKb,
    },
    checks: own.checks,
    opportunities,
    screenshot: a["final-screenshot"]?.details?.data ?? null,
  };
}

/** Primele probleme de rezolvat, în ordinea impactului. */
export function topIssues(r: AuditResult, n = 6) {
  const failed = r.checks.filter((c) => !c.ok).sort((a, b) => b.weight - a.weight).map((c) => (c.detail ? `${c.label}: ${c.detail}` : c.label));
  return [...failed, ...r.opportunities].slice(0, n);
}
