import "server-only";
import tls from "node:tls";

export type TechResult = {
  http_status: number | null; ssl_expires_at: string | null; psi_mobile: number | null; psi_desktop: number | null;
  broken_links: { url: string; status: number }[]; tech_checked_at: string;
};

const UA = "Mozilla/5.0 (compatible; LUNAR-Monitor/1.0; +https://golunar.ro)";

function sslExpiry(host: string): Promise<string | null> {
  return new Promise((resolve) => {
    const sock = tls.connect({ host, port: 443, servername: host, timeout: 8000 }, () => {
      const c = sock.getPeerCertificate();
      sock.end();
      resolve(c?.valid_to ? new Date(c.valid_to).toISOString().slice(0, 10) : null);
    });
    sock.on("error", () => resolve(null));
    sock.on("timeout", () => { sock.destroy(); resolve(null); });
  });
}

async function psi(url: string, strategy: "mobile" | "desktop"): Promise<number | null> {
  const q = new URLSearchParams({ url, strategy, category: "performance" });
  if (process.env.PAGESPEED_API_KEY) q.set("key", process.env.PAGESPEED_API_KEY);
  try {
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: AbortSignal.timeout(55000), cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { lighthouseResult?: { categories?: { performance?: { score: number | null } } } };
    const s = j.lighthouseResult?.categories?.performance?.score;
    return s == null ? null : Math.round(s * 100);
  } catch { return null; }
}

/** Pagina principală + până la 30 de linkuri interne: întoarce cele cu 4xx/5xx. */
async function crawl(url: string): Promise<{ status: number | null; broken: { url: string; status: number }[] }> {
  let html = "", status: number | null = null;
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000), cache: "no-store" });
    status = r.status;
    html = await r.text();
  } catch { return { status: null, broken: [] }; }
  const origin = new URL(url).origin;
  const links = new Set<string>();
  for (const m of html.matchAll(/href="([^"#]+)"/g)) {
    try {
      const u = new URL(m[1], origin);
      if (u.origin === origin && !/\.(png|jpe?g|webp|svg|gif|ico|css|js|xml|txt|pdf)$/i.test(u.pathname)) links.add(u.origin + u.pathname);
    } catch {}
    if (links.size >= 30) break;
  }
  const broken: { url: string; status: number }[] = [];
  await Promise.all([...links].map(async (l) => {
    try {
      const r = await fetch(l, { method: "GET", headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(10000), cache: "no-store" });
      if (r.status >= 400) broken.push({ url: l, status: r.status });
    } catch { broken.push({ url: l, status: 0 }); }
  }));
  return { status, broken };
}

export async function checkSite(domain: string): Promise<TechResult> {
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const url = `https://${host}/`;
  const [ssl, c, m, d] = await Promise.all([sslExpiry(host), crawl(url), psi(url, "mobile"), psi(url, "desktop")]);
  return { http_status: c.status, ssl_expires_at: ssl, psi_mobile: m, psi_desktop: d, broken_links: c.broken, tech_checked_at: new Date().toISOString() };
}
