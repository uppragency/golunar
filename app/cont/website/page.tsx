import { getPortalData } from "@/lib/portal-data";
import { date, monthShort, num } from "@/lib/format";
import { Bars, Pill } from "@/components/app/charts";

export default async function WebsitePage() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const s = d.site;
  const live = s?.status === "live" || s?.status === "transferred";
  const yes = (v: boolean | null | undefined, on = "Conectat", off = "În configurare") => (v ? <b>{on}</b> : <span className="muted">{off}</span>);
  return (
    <div>
      <div className="topbar">
        <div><h1>Website</h1><p>Detalii tehnice, domeniu și performanță.</p></div>
        {s && live && <a className="btn-plain" href={`https://${s.domain}`} target="_blank" rel="noopener">Deschide site-ul ↗</a>}
      </div>
      <div className="g g-3">
        <div className="panel">
          <h3>Domeniu</h3>
          <div className="kv"><span>Nume</span><b>{s?.domain ?? "—"}</b></div>
          <div className="kv"><span>Titular</span><b>{d.company.name}</b></div>
          <div className="kv"><span>Registrar</span><b>{s?.registrar ?? "—"}</b></div>
          <div className="kv"><span>Expiră</span><b>{date(s?.domain_expires_at, { day: "2-digit", month: "2-digit", year: "numeric" })}</b></div>
          <div className="kv"><span>Reînnoire</span><b>Inclusă</b></div>
        </div>
        <div className="panel">
          <h3>Hosting și securitate</h3>
          <div className="kv"><span>Infrastructură</span><b>Vercel · EU</b></div>
          <div className="kv"><span>SSL</span>{live ? <Pill tone="ok">Valid</Pill> : <span className="muted">La lansare</span>}</div>
          <div className="kv"><span>Backup</span><b>Zilnic, 30 zile</b></div>
          <div className="kv"><span>Uptime 90 zile</span><b>{s?.uptime_90d ? `${num(+s.uptime_90d, 2)}%` : "—"}</b></div>
          <div className="kv"><span>Core Web Vitals</span>{s?.cwv_ok == null ? <span className="muted">—</span> : <Pill tone={s.cwv_ok ? "ok" : "warn"}>{s.cwv_ok ? "Bun" : "De îmbunătățit"}</Pill>}</div>
        </div>
        <div className="panel">
          <h3>Email și DNS</h3>
          <div className="kv"><span>Email</span><b>{s?.email_provider ?? "—"}</b></div>
          <div className="kv"><span>SPF / DKIM / DMARC</span>{s?.dns_auth_ok ? <Pill tone="ok">Configurate</Pill> : <span className="muted">În configurare</span>}</div>
          <div className="kv"><span>Google Analytics 4</span>{yes(Boolean(s?.ga4_id) || live)}</div>
          <div className="kv"><span>Search Console</span>{yes(s?.search_console)}</div>
          <div className="kv"><span>Business Profile</span>{yes(s?.business_profile, "Verificat", "—")}</div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Vizitatori · ultimele 12 luni</h3>
        <Bars data={d.metrics.slice(-12).map((m) => ({ label: monthShort(m.month), value: m.visitors, title: `${num(m.visitors)} vizitatori` }))} />
      </div>
    </div>
  );
}
