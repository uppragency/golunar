import Link from "next/link";
import { getPortalData } from "@/lib/portal-data";
import { money, date, monthShort, num } from "@/lib/format";
import { Pill, Ring, Spark } from "@/components/app/charts";
import { Plus } from "@/components/site/visuals";
import { REQ_PILL, SITE_PILL, cap } from "@/lib/labels";

export default async function PortalHome() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const { company, site, currency: cur, next, paid, open, metrics, launch } = d;
  const first = (company.legal_rep || "").split(" ").pop() || "";
  const last = metrics.at(-1), prev = metrics.at(-2);
  const delta = (a?: number, b?: number) => (a && b ? Math.round(((a - b) / b) * 100) : null);
  const vDelta = delta(last?.visitors, prev?.visitors), lDelta = delta(last?.form_leads, prev?.form_leads);
  const monthReqs = d.requests.filter((r) => r.type === "improvement").slice(0, 3);
  const status = d.overdue.length
    ? "Avem o plată restantă. Actualizează metoda de plată ca site-ul să rămână online."
    : site?.status === "live" || site?.status === "transferred"
      ? "Website-ul tău e online și funcționează. Totul la zi."
      : launch
        ? `Lansarea e în ziua ${launch.day_counter} din 10.${launch.sla_paused ? " Ceasul e oprit: așteptăm materiale de la tine." : ""}`
        : "Primul pas: plata primei rate și brief-ul de 5 minute.";
  const [tone, label] = site?.status === "transferred" ? (["ok", "Online · proprietar"] as const) : SITE_PILL[site?.status ?? "onboarding"];
  const nextIdx = d.installments.findIndex((i) => i.status !== "paid");

  return (
    <div>
      <div className="topbar">
        <div><h1>Bună{first ? `, ${first}` : " ziua"}.</h1><p>{status}</p></div>
        <div className="tb-r">
          <Link href="/cont/cereri" className="btn btn-accent"><span className="ic"><Plus /></span>Cere o îmbunătățire</Link>
        </div>
      </div>

      <div className="g">
        <div className="panel site-hero">
          <div className="info">
            <Pill tone={tone}>{label}{site?.uptime_90d && site.status === "live" ? ` · ${num(+site.uptime_90d, 2)}% uptime` : ""}</Pill>
            <div className="dom">{site?.domain ?? "—"}</div>
            <span className="muted" style={{ fontSize: 14 }}>Plan {d.planName}{d.addonNames.length ? ` · ${d.addonNames.join(" · ")}` : ""}</span>
            <div className="facts">
              <div><span>Lansat</span><b>{site?.launched_at ? date(site.launched_at) : "În curând"}</b></div>
              <div><span>SSL</span><b>{site?.status === "live" || site?.status === "transferred" ? "Activ · auto" : "La lansare"}</b></div>
              <div><span>Ultimul backup</span><b>{site?.last_backup_at ? date(site.last_backup_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</b></div>
              <div><span>Domeniu expiră</span><b>{date(site?.domain_expires_at)}</b></div>
              <div><span>Vizitatori · 30 zile</span><b>{last ? num(last.visitors) : "—"} {vDelta !== null && <small style={{ color: vDelta >= 0 ? "var(--ok)" : "var(--bad)" }}>{vDelta >= 0 ? "+" : ""}{vDelta}%</small>}</b></div>
              <div><span>Cereri formular</span><b>{last ? num(last.form_leads) : "—"} {lDelta !== null && <small style={{ color: lDelta >= 0 ? "var(--ok)" : "var(--bad)" }}>{lDelta >= 0 ? "+" : ""}{lDelta}%</small>}</b></div>
            </div>
          </div>
          <div className="preview">
            <div className="mini-nav"><span>{company.name.split(" ")[0].toUpperCase()}</span><span>Contact</span></div>
            <small>{site?.preview_subtitle || site?.domain}</small>
            <h6 dangerouslySetInnerHTML={{ __html: (site?.preview_title || company.name).replace(/<(?!br\s*\/?>)[^>]*>/gi, "") }} />
          </div>
        </div>

        <div className="g g-2">
          <div className="panel">
            <h3>Drumul spre proprietate <Link href="/cont/plati">Calendar plăți →</Link></h3>
            <div className="own-bar" role="progressbar" aria-valuemin={0} aria-valuemax={12} aria-valuenow={Math.min(12, paid.length)} aria-label="Plăți efectuate din 12">
              <div className="own-head">
                <b>{Math.min(12, paid.length)} din 12 plăți</b>
                <span>{d.ownership?.transferred_at || paid.length >= 12 ? "Website-ul este al tău" : `Al tău în ${new Date(d.installments.at(-1)?.due_date ?? Date.now()).toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}`}</span>
              </div>
              <div className="own-track"><i style={{ width: `${Math.min(100, (paid.length / 12) * 100)}%` }} /></div>
            </div>
            <div className="ring-wrap">
              <Ring paid={paid.length} />
              <div style={{ flex: 1 }}>
                <div className="kv"><span>Rămas până la proprietate</span><b>{money(d.sum(open), cur)}</b></div>
                <div className="kv"><span>Mai ai de plătit în {new Date().getFullYear()}</span><b>{money(d.sum(d.remainingYear), cur)}</b></div>
                <div className="kv"><span>Website-ul devine al tău</span><b>{d.ownership?.transferred_at ? `Al tău din ${date(d.ownership.transferred_at)}` : date(d.installments.at(-1)?.due_date)}</b></div>
              </div>
            </div>
            <div className="months">
              {d.installments.map((i, idx) => (
                <div key={i.id} className={i.status === "paid" ? "p" : idx === nextIdx ? "n" : ""} title={`Rata ${i.number} · ${date(i.due_date)}`}>{monthShort(i.due_date)}</div>
              ))}
            </div>
          </div>
          <div className="panel next">
            <h3 style={{ margin: 0 }}>Următoarea plată</h3>
            {next ? (
              <>
                <div>
                  <div className="amt">{money(next.amount_net, cur)}</div>
                  <span className="muted" style={{ fontSize: 13 }}>TVA inclus</span>
                </div>
                <div className="kv"><span>Data</span><b>{date(next.due_date)}</b></div>
                <div className="kv"><span>Metodă</span><b>{d.sub?.payment_mode === "bank_transfer" ? "Transfer bancar" : d.pms[0] ? `${cap(d.pms[0].brand)} •• ${d.pms[0].last4}` : "Card"}</b></div>
                <div className="kv"><span>Rata</span><b>{next.number} din 12</b></div>
                <Link className="btn-plain" href="/cont/metode">Schimbă metoda de plată</Link>
              </>
            ) : (
              <p className="muted">Toate cele 12 rate sunt plătite. Website-ul este al tău.</p>
            )}
          </div>
        </div>

        <div className="g g-2">
          <div className="panel">
            <h3>Îmbunătățiri luna aceasta <Link href="/cont/cereri">Toate cererile →</Link></h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span className="muted">Folosite</span><b>{d.usedThisMonth} din {d.quota}</b></div>
            <div className="usage">{Array.from({ length: d.quota }, (_, i) => <i key={i} className={i < d.usedThisMonth ? "u" : ""} />)}</div>
            {monthReqs.length ? monthReqs.map((r) => (
              <div className="req" key={r.id}>
                <div>{r.title}<small>{date(r.created_at, { day: "numeric", month: "short" })} · {REQ_PILL[r.status][1].toLowerCase()}</small></div>
                <Pill tone={REQ_PILL[r.status][0]}>{REQ_PILL[r.status][1]}</Pill>
              </div>
            )) : <div className="empty">Nicio cerere încă. Ai {d.quota} {d.quota === 1 ? "îmbunătățire inclusă" : "îmbunătățiri incluse"} lunar.</div>}
          </div>
          <div className="panel">
            <h3>Raport {last ? new Date(last.month).toLocaleDateString("ro-RO", { month: "long" }) : "lunar"}</h3>
            {metrics.length > 1 ? (
              <>
                <Spark values={metrics.map((m) => m.visitors)} />
                <div className="kv"><span>Poziție medie Google</span><b>{last?.avg_position ? num(+last.avg_position, 1) : "—"} {prev?.avg_position && last?.avg_position && <small style={{ color: +last.avg_position <= +prev.avg_position ? "var(--ok)" : "var(--bad)" }}>{+last.avg_position <= +prev.avg_position ? "↑" : "↓"} {num(Math.abs(+prev.avg_position - +last.avg_position), 1)}</small>}</b></div>
                <div className="kv"><span>Apeluri din Maps</span><b>{last?.maps_calls ?? "—"}</b></div>
              </>
            ) : <div className="empty">Primul raport ajunge în ziua 3 a lunii de după lansare.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

