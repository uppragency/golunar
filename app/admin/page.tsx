import Link from "next/link";
import { getAdminData } from "@/lib/admin-data";
import { money, monthShort, num } from "@/lib/format";
import { Bars, Pill } from "@/components/app/charts";
import { Plus } from "@/components/site/visuals";

const eur = (v: number) => money(Math.round(v), "EUR");

export default async function AdminHome() {
  const d = await getAdminData();
  const growth = d.prevMrr ? ((d.mrr - d.prevMrr) / d.prevMrr) * 100 : null;
  const monthName = new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
  const ltv = d.churn > 0 ? d.arpu / d.churn : null;
  const colors: Record<string, string> = { essential: "#52525B", growth: "var(--accent)", partner: "#F5F5F6" };
  return (
    <div>
      <div className="topbar">
        <div><h1 style={{ textTransform: "capitalize" }}>{monthName}</h1><p>Venit recurent, încasări și lansări în curs. Sume în EUR fără TVA, RON convertit la 5,09.</p></div>
        <div className="tb-r">
          <a className="btn-plain" href="/admin/export">Export CSV</a>
          <Link href="/admin/clienti/nou" className="btn btn-accent"><span className="ic"><Plus /></span>Client nou</Link>
        </div>
      </div>
      <div className="g g-4">
        <div className="panel kpi"><span className="l">MRR</span><b>{eur(d.mrr)}</b><span className={`d${growth !== null && growth < 0 ? " n" : ""}`}>{growth === null ? "—" : `${growth >= 0 ? "+" : ""}${num(growth, 1)}% față de luna trecută`}</span></div>
        <div className="panel kpi"><span className="l">ARR</span><b>{eur(d.arr)}</b><span className="d" style={{ color: "var(--mute)" }}>MRR × 12</span></div>
        <div className="panel kpi"><span className="l">Clienți activi</span><b>{d.active.length}</b><span className="d">+{d.newThisMonth} noi · −{d.canceled30} anulați</span></div>
        <div className="panel kpi"><span className="l">Churn lunar</span><b>{num(d.churn * 100, 1)}%</b><span className={`d${d.churn > 0.025 ? " n" : ""}`}>Țintă &lt; 2,5%</span></div>
      </div>
      <div className="g g-21" style={{ marginTop: 12 }}>
        <div className="panel"><h3>Venit programat · ultimele 12 luni</h3><Bars data={d.mrrSeries.map((m) => ({ label: monthShort(`${m.month}-01`), value: m.value, title: eur(m.value) }))} /></div>
        <div className="panel">
          <h3>Mix abonamente</h3>
          <div className="mix">{d.mix.filter((m) => m.mrr > 0).map((m) => <i key={m.plan} style={{ flex: m.mrr, background: colors[m.plan] }} />)}</div>
          <div className="legend">
            {d.mix.map((m) => <div key={m.plan}><span style={{ ["--c" as string]: colors[m.plan] }}>{m.name} · {m.count}</span><b>{eur(m.mrr)}</b></div>)}
          </div>
          <div className="kv" style={{ marginTop: 18 }}><span>ARPU</span><b>{eur(d.arpu)}</b></div>
          <div className="kv"><span>LTV estimat (churn {num(d.churn * 100, 1)}%)</span><b>{ltv ? eur(ltv) : "—"}</b></div>
        </div>
      </div>
      <div className="g g-3" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Necesită atenție</h3>
          {d.restants.map((c) => (
            <div className="req" key={c.id}><div><Link href={`/admin/clienti/${c.id}`}>{c.name} · plată eșuată</Link><small>{eur(c.overdueAmount)} cu TVA · {c.mode === "card" ? "reîncercare automată Stripe" : "transfer neprimit"}</small></div><Pill tone="bad">Restant</Pill></div>
          ))}
          {d.unmatched.slice(0, 3).map((t) => (
            <div className="req" key={t.id}><div><Link href="/admin/incasari">{t.payer_name} · transfer neidentificat</Link><small>{money(+t.amount, t.currency, 2)} · {t.reference ?? "fără referință"}</small></div><Pill tone="warn">Reconciliere</Pill></div>
          ))}
          {d.launches.filter((l) => l.day_counter >= 8 || l.sla_paused).map((l) => (
            <div className="req" key={l.id}><div><Link href="/admin/lansari">{l.companies?.name} · ziua {l.day_counter}/10</Link><small>{l.paused_reason ?? "Termen aproape"}</small></div><Pill tone="warn">Risc SLA</Pill></div>
          ))}
          {!d.restants.length && !d.unmatched.length && !d.launches.some((l) => l.day_counter >= 8 || l.sla_paused) && <div className="empty">Nimic urgent.</div>}
        </div>
        <div className="panel">
          <h3>Transferuri de proprietate</h3>
          {d.transfersByMonth.length ? d.transfersByMonth.map(([m, n]) => (
            <div className="kv" key={m}><span style={{ textTransform: "capitalize" }}>{new Date(`${m}-01`).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}</span><b>{n} {n === 1 ? "client" : "clienți"}</b></div>
          )) : <div className="kv"><span>Următoarele luni</span><b>—</b></div>}
          <div className="kv"><span>Rata de continuare după luna 12</span><b>{d.continuation === null ? "—" : `${num(d.continuation * 100)}%`}</b></div>
        </div>
        <div className="panel">
          <h3>Îmbunătățiri luna aceasta</h3>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span className="muted">Consumate din capacitate</span><b>{d.usedImpr} / {d.capacity}</b></div>
          <div className="usage">{Array.from({ length: 10 }, (_, i) => <i key={i} className={d.capacity && i < Math.round((d.usedImpr / d.capacity) * 10) ? "u" : ""} />)}</div>
          <div className="kv"><span>Cereri deschise</span><b>{d.requests.filter((r) => r.status === "new" || r.status === "in_progress").length}</b></div>
          <div className="kv"><span>Ore lucrate luna aceasta</span><b>{num(d.requests.filter((r) => r.month_bucket?.startsWith(new Date().toISOString().slice(0, 7))).reduce((a, r) => a + Number(r.hours_spent ?? 0), 0), 1)} h</b></div>
        </div>
      </div>
    </div>
  );
}
