import Link from "next/link";
import { getOps } from "@/lib/admin-ops";
import { date } from "@/lib/format";
import { runTechCheck } from "@/app/admin/actions";
import { Pill } from "@/components/app/charts";

export const metadata = { title: "Raport tehnic" };
export const maxDuration = 120;

const Score = ({ v }: { v: number | null }) => v == null ? <span className="muted">—</span> : <span className={`score ${v >= 90 ? "g" : v >= 50 ? "m" : "b"}`}>{v}</span>;

export default async function TechPage() {
  const d = await getOps();
  const sites = [...d.sites].sort((a, b) => b.issues.length - a.issues.length);
  return (
    <div>
      <div className="topbar"><div><h1>Raport tehnic</h1><p>Se actualizează automat pe 1 ale lunii: viteză PageSpeed, SSL, status HTTP, linkuri interne rupte. Uptime la fiecare 10 minute.</p></div></div>
      <div className="g g-4">
        <div className="panel kpi"><span className="l">Site-uri</span><b>{sites.length}</b><span className="d" style={{ color: "var(--mute)" }}>monitorizate</span></div>
        <div className="panel kpi"><span className="l">Cu probleme</span><b>{sites.filter((s) => s.issues.length).length}</b><span className="d n">de rezolvat</span></div>
        <div className="panel kpi"><span className="l">Viteză mobil sub 90</span><b>{sites.filter((s) => s.psi_mobile != null && s.psi_mobile < 90).length}</b><span className="d" style={{ color: "var(--mute)" }}>PageSpeed</span></div>
        <div className="panel kpi"><span className="l">Expiră în 30 de zile</span><b>{sites.filter((s) => (s.domainDays ?? 99) <= 30 || (s.sslDays ?? 99) <= 30).length}</b><span className="d" style={{ color: "var(--mute)" }}>domeniu sau SSL</span></div>
      </div>
      <div className="panel tech" style={{ marginTop: 12 }}>
        <div className="tbl"><table>
          <thead><tr><th>Site</th><th>Uptime 90z</th><th>Mobil</th><th>Desktop</th><th>SSL</th><th>Domeniu</th><th>Linkuri rupte</th><th>Verificat</th><th /></tr></thead>
          <tbody>
            {sites.map((w) => (
              <tr key={w.id}>
                <td><Link href={`/admin/clienti/${w.company_id}`}><b style={{ fontWeight: 500 }}>{w.domain}</b></Link><div className="muted" style={{ fontSize: 12 }}>{w.name}</div>{w.issues.length ? <div style={{ marginTop: 4 }}><Pill tone={w.down ? "bad" : "warn"}>{w.issues.join(" · ")}</Pill></div> : null}</td>
                <td className="mono">{w.uptime_90d != null ? `${(+w.uptime_90d).toFixed(2)}%` : "—"}</td>
                <td><Score v={w.psi_mobile} /></td><td><Score v={w.psi_desktop} /></td>
                <td className="mono">{w.ssl_expires_at ? date(w.ssl_expires_at, { day: "numeric", month: "short", year: "2-digit" }) : "—"}</td>
                <td className="mono">{w.domain_expires_at ? date(w.domain_expires_at, { day: "numeric", month: "short", year: "2-digit" }) : "—"}</td>
                <td>{w.broken.length ? <details><summary>{w.broken.length}</summary>{w.broken.map((b) => <div key={b.url} className="muted" style={{ fontSize: 12 }}>{b.status || "eroare"} · {b.url.replace(/^https?:\/\/[^/]+/, "")}</div>)}</details> : <span className="muted">0</span>}</td>
                <td className="muted" style={{ fontSize: 12 }}>{w.tech_checked_at ? date(w.tech_checked_at, { day: "numeric", month: "short" }) : "niciodată"}</td>
                <td><form action={runTechCheck}><input type="hidden" name="id" value={w.id} /><button className="btn-plain sm">Verifică</button></form></td>
              </tr>
            ))}
            {!sites.length && <tr><td colSpan={9} className="muted" style={{ textAlign: "center", padding: 28 }}>Niciun site.</td></tr>}
          </tbody>
        </table></div>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Fără cheie PAGESPEED_API_KEY, Google limitează verificările de viteză; scorurile pot lipsi.</p>
    </div>
  );
}
