import { getPortalData } from "@/lib/portal-data";
import { date, dateNum, money } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import { INST_PILL, SPV_PILL } from "@/lib/labels";

export default async function BillingPage() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const cur = d.currency;
  const nextIdx = d.installments.findIndex((i) => i.status !== "paid");
  return (
    <div>
      <div className="topbar"><div><h1>Plăți și facturi</h1><p>Facturile sunt transmise automat în SPV (e-Factura). Sume finale, în {cur === "EUR" ? "euro" : "lei"}, TVA inclus.</p></div></div>
      <div className="g g-4">
        <div className="panel kpi"><span className="l">Plătit până acum</span><b>{money(d.sum(d.paid), cur)}</b><span className="d" style={{ color: "var(--mute)" }}>{d.paid.length} {d.paid.length === 1 ? "rată" : "rate"}</span></div>
        <div className="panel kpi"><span className="l">Rămas până la proprietate</span><b>{money(d.sum(d.open), cur)}</b><span className="d" style={{ color: "var(--mute)" }}>{d.open.length} rate</span></div>
        <div className="panel kpi"><span className="l">Rămas în {new Date().getFullYear()}</span><b>{money(d.sum(d.remainingYear), cur)}</b><span className="d" style={{ color: "var(--mute)" }}>{d.remainingYear.length} {d.remainingYear.length === 1 ? "rată" : "rate"}</span></div>
        <div className="panel kpi"><span className="l">Restanțe</span><b>{money(d.sum(d.overdue), cur)}</b><span className={`d${d.overdue.length ? " n" : ""}`}>{d.overdue.length ? `${d.overdue.length} ${d.overdue.length === 1 ? "rată" : "rate"}` : "La zi"}</span></div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Calendar plăți · primele 12 luni</h3>
        <div className="tbl"><table>
          <thead><tr><th>Rata</th><th>Scadență</th><th>Abonament</th><th>Opțiuni</th><th className="r">Total</th><th>Status</th></tr></thead>
          <tbody>
            {d.installments.map((i, idx) => {
              const [tone, label] = idx === nextIdx && i.status === "scheduled" ? (["acc", "Următoarea"] as const) : INST_PILL[i.status];
              return (
                <tr key={i.id}>
                  <td>{i.number}/12</td><td>{date(i.due_date)}</td><td>{money(i.amount_plan, cur)}</td><td>{i.amount_addons ? money(i.amount_addons, cur) : "—"}</td>
                  <td className="r">{money(i.amount_net, cur)}</td>
                  <td><Pill tone={tone}>{label}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Facturi</h3>
        {d.invoices.length ? (
          <div className="tbl"><table>
            <thead><tr><th>Număr</th><th>Data</th><th>Perioadă</th><th className="r">Total</th><th>Plată</th><th>e-Factura</th><th className="r">Descarcă</th></tr></thead>
            <tbody>
              {d.invoices.map((v) => {
                const [tone, label] = SPV_PILL[v.spv_status] ?? [undefined, v.spv_status];
                return (
                  <tr key={v.id}>
                    <td className="mono">{v.smartbill_series}-{v.smartbill_number}</td><td>{dateNum(v.issued_at)}</td><td>{v.period_label ?? "—"}</td>
                    <td className="r">{money(+v.total, v.currency, 2)}</td><td>{v.payment_label ?? "—"}</td><td><Pill tone={tone}>{label}</Pill></td>
                    <td className="r"><span className="dl">
                      {v.pdf_path ? <a className="btn-plain sm" href={`/api/files/${v.id}?k=pdf`}>PDF</a> : <button disabled title="PDF-ul apare după emiterea în SmartBill">PDF</button>}
                      {v.xml_path ? <a className="btn-plain sm" href={`/api/files/${v.id}?k=xml`}>XML</a> : <button disabled title="XML-ul apare după validarea SPV">XML</button>}
                    </span></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        ) : <div className="empty">Prima factură se emite automat după prima plată.</div>}
      </div>
    </div>
  );
}
