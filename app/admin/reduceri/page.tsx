import { requireAdmin } from "@/lib/session";
import { getOps } from "@/lib/admin-ops";
import { money } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import { SaveForm } from "@/components/app/forms";
import { createDiscount, toggleDiscount } from "@/app/admin/actions";
import { PLANS, type PlanCode } from "@/lib/plans";
import { SITE_URL } from "@/lib/env";

const dt = (v: string | null) => (v ? new Date(v).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default async function DiscountsPage() {
  const s = await requireAdmin();
  const ops = await getOps();
  const stat = new Map(ops.codeStats.map((x) => [x.id, x]));
  const { data: codes } = await s.supabase.from("discount_codes").select("*").order("created_at", { ascending: false });
  const now = Date.now();
  return (
    <div>
      <div className="topbar"><div><h1>Coduri de reducere</h1><p>Reducere pe primele N rate, procentuală sau sumă fixă. Clienții o aplică în pagina de abonamente și în checkout.</p></div></div>
      <div className="g g-2">
        <div className="panel form-dark">
          <h3>Cod nou</h3>
          <SaveForm action={createDiscount} label="Creează codul">
            <div className="grid2">
              <div className="fld"><label>Cod</label><input name="code" required placeholder="LANSARE20" style={{ textTransform: "uppercase" }} /></div>
              <div className="fld"><label>Tip</label><select name="kind" defaultValue="percent"><option value="percent">Procent</option><option value="fixed">Sumă fixă / lună</option></select></div>
            </div>
            <div className="grid2">
              <div className="fld"><label>Procent (%)</label><input name="percent" type="number" min="1" max="100" step="0.01" placeholder="20" /></div>
              <div className="fld"><label>Aplicat la primele … rate</label><input name="months" type="number" min="1" max="12" defaultValue={1} required /></div>
            </div>
            <div className="grid2">
              <div className="fld"><label>Sumă fixă (lei)</label><input name="amount_ron" type="number" min="1" step="0.01" placeholder="100" /></div>
              <div className="fld"><label>Sumă fixă (€)</label><input name="amount_eur" type="number" min="1" step="0.01" placeholder="20" /></div>
            </div>
            <div className="grid2">
              <div className="fld"><label>Valabil de la</label><input name="starts_at" type="date" /></div>
              <div className="fld"><label>Valabil până la</label><input name="ends_at" type="date" /></div>
            </div>
            <div className="grid2">
              <div className="fld"><label>Utilizări maxime (gol = nelimitat)</label><input name="max_redemptions" type="number" min="1" /></div>
              <div className="fld"><label>Descriere internă</label><input name="description" placeholder="Campanie Black Friday" /></div>
            </div>
            <div className="fld"><label>Planuri (niciunul bifat = toate)</label>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {(Object.keys(PLANS) as PlanCode[]).map((p) => <label key={p} className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="plans" value={p} />{PLANS[p].name}</label>)}
              </div>
            </div>
            <label className="check" style={{ color: "var(--mute)" }}><input type="checkbox" name="new_customers_only" />Doar clienți noi (CUI fără abonament)</label>
          </SaveForm>
        </div>
        <div className="panel">
          <h3>Cum se folosește</h3>
          <div className="kv"><span>Link direct cu cod</span><b className="mono" style={{ fontSize: 12 }}>{SITE_URL}/?cod=COD#abonamente</b></div>
          <p className="muted" style={{ fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>Codul se aplică automat din link sau manual la „Ai un cod de reducere?”. Se revalidează pe server la plată. La card se creează un cupon Stripe pentru numărul de luni ales; la transfer, reducerea apare direct în ratele din calendar.</p>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Coduri</h3>
        {codes?.length ? (
          <div className="tbl"><table>
            <thead><tr><th>Cod</th><th>Reducere</th><th>Rate</th><th>Planuri</th><th>Valabilitate</th><th>Utilizări</th><th>Rezultate</th><th>Status</th><th /></tr></thead>
            <tbody>
              {codes.map((c) => {
                const expired = (c.ends_at && new Date(c.ends_at).getTime() < now) || (c.max_redemptions && c.redemptions >= c.max_redemptions);
                return (
                  <tr key={c.id}>
                    <td><b className="mono">{String(c.code).toUpperCase()}</b>{c.description && <small style={{ display: "block", color: "var(--mute)" }}>{c.description}</small>}{c.new_customers_only && <small style={{ display: "block", color: "var(--accent2)" }}>Doar clienți noi</small>}</td>
                    <td>{c.kind === "percent" ? `${Number(c.percent)}%` : `${Number(c.amount_ron)} lei / ${Number(c.amount_eur)} €`}</td>
                    <td>{c.months === 12 ? "Toate 12" : `Primele ${c.months}`}</td>
                    <td>{c.plans ? (c.plans as PlanCode[]).map((p) => PLANS[p].name).join(", ") : "Toate"}</td>
                    <td>{dt(c.starts_at)} → {dt(c.ends_at)}</td>
                    <td>{c.redemptions}{c.max_redemptions ? ` / ${c.max_redemptions}` : ""}</td>
                    <td style={{ fontSize: 12.5 }}>{(() => { const x = stat.get(c.id); if (!x || !x.orders) return <span className="muted">—</span>; return <>{x.orders} comenzi · {x.converted} plătite<br /><span className="muted">{x.stayed} active · {x.canceled} anulate · {money(Math.round(x.revenue), "RON")}</span></>; })()}</td>
                    <td><Pill tone={!c.active ? "bad" : expired ? "warn" : "ok"}>{!c.active ? "Oprit" : expired ? "Epuizat" : "Activ"}</Pill></td>
                    <td><form action={toggleDiscount}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(!c.active)} /><button className="btn-plain sm">{c.active ? "Oprește" : "Pornește"}</button></form></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        ) : <div className="empty">Niciun cod încă.</div>}
      </div>
    </div>
  );
}
