import Link from "next/link";
import { getOps } from "@/lib/admin-ops";
import { EUR_RON } from "@/lib/plans";
import { money, monthShort, num } from "@/lib/format";
import { Bars, Pill } from "@/components/app/charts";
import { Plus } from "@/components/site/visuals";
import TodayInbox from "@/components/app/TodayInbox";

const eur = (v: number) => money(Math.round(v * EUR_RON), "RON");

export default async function AdminHome() {
  const d = await getOps();
  const growth = d.prevMrr ? ((d.mrr - d.prevMrr) / d.prevMrr) * 100 : null;
  const monthName = new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" });
  const ltv = d.churn > 0 ? d.arpu / d.churn : null;
  const colors: Record<string, string> = { essential: "#52525B", growth: "var(--accent)", partner: "#F5F5F6" };
  return (
    <div>
      <div className="topbar">
        <div><h1 style={{ textTransform: "capitalize" }}>{monthName}</h1><p>Venit recurent, încasări și lansări în curs. Sume în lei, fără TVA; abonamentele în euro sunt convertite la 5,09.</p></div>
        <div className="tb-r">
          <a className="btn-plain" href="/admin/export">Export CSV</a>
          <Link href="/admin/clienti/nou" className="btn btn-accent"><span className="ic"><Plus /></span>Client nou</Link>
        </div>
      </div>
      <form action="/admin/cauta" className="gsearch"><input name="q" placeholder="Caută firmă, CUI, email, LNR-0001 sau domeniu" aria-label="Căutare globală" /><button className="btn-plain sm">Caută</button></form>
      <TodayInbox d={d} />
      <div style={{ height: 12 }} />
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
          <h3>Valoarea recomandărilor</h3>
          {d.referralValue.length ? d.referralValue.slice(0, 6).map((r) => (
            <div className="kv" key={r.id}><span><Link href={`/admin/clienti/${r.id}`}>{r.name}</Link> · {r.count} {r.count === 1 ? "client adus" : "clienți aduși"}</span><b>{money(Math.round(r.revenue), "RON")}</b></div>
          )) : <div className="empty">Încă nicio recomandare convertită.</div>}
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Venit încasat de la clienții aduși prin recomandare.</p>
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
      <div className="g g-2" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Oferta 4,99 lei · câți clienți rămân</h3>
          {d.golunar && d.golunar.orders ? (
            <>
              <div className="kv"><span>Comenzi cu GOLUNAR</span><b>{d.golunar.orders} · {d.golunar.converted} plătite</b></div>
              <div className="cohort">{d.golunar.steps.map((x) => (
                <div key={x.n}>Luna {x.n}<b>{x.due ? `${Math.round((x.paid / x.due) * 100)}%` : "—"}</b>{x.paid}/{x.due}</div>
              ))}</div>
              <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Procent din clienții la care rata respectivă a ajuns la scadență. Încasat total: {money(Math.round(d.golunar.revenue), "RON")}.</p>
            </>
          ) : <div className="empty">Încă nu sunt comenzi cu GOLUNAR.</div>}
        </div>
        <div className="panel">
          <h3>Venit recurent pe plan</h3>
          {d.mix.map((m) => <div className="kv" key={m.plan}><span>{m.name} · {m.count} {m.count === 1 ? "client" : "clienți"}</span><b>{eur(m.mrr)} / lună</b></div>)}
          <div className="kv"><span>Total MRR</span><b>{eur(d.mrr)}</b></div>
          <div className="kv"><span>Comenzi neplătite</span><b>{d.orders.length}</b></div>
        </div>
      </div>
    </div>
  );
}
