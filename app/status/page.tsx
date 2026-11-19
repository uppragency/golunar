import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import PageShell from "@/components/site/PageShell";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

export const revalidate = 300;

const DESC = "Status LUNAR în timp real: disponibilitatea website-urilor găzduite, timpul de răspuns și îmbunătățirile livrate clienților în ultimele 90 de zile.";

export const metadata: Metadata = {
  title: { absolute: "Status servicii și uptime website-uri · LUNAR" },
  description: DESC,
  alternates: { canonical: "/status" },
  openGraph: { title: "Status servicii LUNAR", description: DESC, url: "/status", type: "website" },
};

type Status = {
  generated_at: string; sites_monitored: number; checks_30d: number; uptime_30d: number | null; avg_ms_24h: number | null; all_up: boolean;
  days: { day: string; pct: number | null }[];
  sites: { domain: string; up30: number | null; ok: boolean | null; ms: number | null; at: string | null }[];
  delivered_30d: number; delivered_90d: number; recent: { date: string; type: string }[];
};

async function load(): Promise<Status | null> {
  try {
    const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    const { data, error } = await db.rpc("public_status");
    if (error) throw error;
    return data as Status;
  } catch (e) {
    console.error("[status]", e);
    return null;
  }
}

const pctFmt = (v: number | null | undefined, d = 2) => (v == null ? "—" : `${Number(v).toLocaleString("ro-RO", { maximumFractionDigits: d })}%`);
const dayFmt = (d: string) => new Date(d).toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
const TYPE: Record<string, string> = { improvement: "Îmbunătățire livrată", bug: "Problemă rezolvată", billing: "Cerere de facturare rezolvată" };

export default async function StatusPage() {
  const s = await load();
  const hasData = !!s && s.checks_30d > 0;
  const up = !s || s.all_up;
  return (
    <PageShell
      crumbs={[["/status", "Status"]]}
      eyebrow="Status"
      title={hasData ? (up ? <>Toate sistemele funcționează. <span className="dim">Verificat la fiecare 10 minute.</span></> : <>Investigăm o problemă. <span className="dim">Actualizăm pagina automat.</span></>) : <>Status servicii. <span className="dim">Transparent, în timp real.</span></>}
      lede="Monitorizăm fiecare website găzduit la fiecare 10 minute, din exterior, ca un vizitator real. Aici vezi disponibilitatea și ce am livrat clienților, fără date personale."
      meta={<span className={`pill ${up ? "ok" : "bad"}`}><span className="d" />{up ? "Operațional" : "Incident în curs"}{s ? ` · actualizat ${new Date(s.generated_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Bucharest" })}` : ""}</span>}
      cta={false}
    >
      <div className="wide-block">
        <div className="st-kpis">
          <div className="card"><span>Uptime 30 de zile</span><b>{hasData ? pctFmt(s!.uptime_30d, 3) : "—"}</b><small>{hasData ? `${s!.checks_30d.toLocaleString("ro-RO")} verificări` : "Monitorizarea pornește la primul site live"}</small></div>
          <div className="card"><span>Website-uri monitorizate</span><b>{s?.sites_monitored ?? "—"}</b><small>la fiecare 10 minute</small></div>
          <div className="card"><span>Timp mediu de răspuns · 24h</span><b>{s?.avg_ms_24h != null ? `${s.avg_ms_24h} ms` : "—"}</b><small>măsurat din exterior</small></div>
          <div className="card"><span>Îmbunătățiri livrate · 30 zile</span><b>{s?.delivered_30d ?? "—"}</b><small>{s ? `${s.delivered_90d} în ultimele 90 de zile` : ""}</small></div>
        </div>

        <section className="card st-block" aria-labelledby="st-days">
          <div className="st-head"><h2 id="st-days">Disponibilitate · ultimele 30 de zile</h2><span>{hasData ? pctFmt(s!.uptime_30d, 3) : "fără date încă"}</span></div>
          <div className="st-bars" role="list">
            {(s?.days ?? Array.from({ length: 30 }, (_, i) => ({ day: new Date(Date.now() - (29 - i) * 864e5).toISOString(), pct: null }))).map((d) => {
              const tone = d.pct == null ? "na" : d.pct >= 99.9 ? "ok" : d.pct >= 99 ? "mid" : "bad";
              return <i role="listitem" key={d.day} className={tone} title={`${dayFmt(d.day)} · ${d.pct == null ? "fără date" : pctFmt(d.pct)}`} aria-label={`${dayFmt(d.day)}: ${d.pct == null ? "fără date" : pctFmt(d.pct)}`} />;
            })}
          </div>
          <div className="st-legend"><span>acum 30 de zile</span><span><i className="ok" />≥ 99,9%<i className="mid" />≥ 99%<i className="bad" />sub 99%<i className="na" />fără date</span><span>azi</span></div>
        </section>

        {s && s.sites.length > 0 && (
          <section className="card st-block" aria-labelledby="st-sites">
            <div className="st-head"><h2 id="st-sites">Website-uri publice</h2><span>cu acordul clienților</span></div>
            <ul className="st-sites">
              {s.sites.map((w) => (
                <li key={w.domain}>
                  <span className={`st-dot ${w.ok === false ? "bad" : w.ok ? "ok" : "na"}`} aria-hidden="true" />
                  <b>{w.domain}</b>
                  <span>{pctFmt(w.up30)} · 30 zile</span>
                  <span>{w.ms != null ? `${w.ms} ms` : "—"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="card st-block" aria-labelledby="st-log">
          <div className="st-head"><h2 id="st-log">Livrat recent</h2><span>fără detalii despre clienți</span></div>
          {s && s.recent.length ? (
            <ul className="st-log">
              {s.recent.map((r, i) => <li key={`${r.date}-${i}`}><time dateTime={r.date}>{dayFmt(r.date)}</time><span>{TYPE[r.type] ?? "Cerere rezolvată"}</span></li>)}
            </ul>
          ) : <p className="muted">Primele livrări apar aici imediat după lansarea primilor clienți.</p>}
        </section>

        <p className="st-foot muted">Cum măsurăm: o cerere HTTPS la fiecare 10 minute către fiecare site live; răspunsurile 2xx și 3xx sub 15 secunde contează ca disponibil. Datele se păstrează 120 de zile. Vrei un site monitorizat așa? <Link href="/cum-lucram" className="inl">Vezi cum lucrăm</Link>.</p>
      </div>
    </PageShell>
  );
}
