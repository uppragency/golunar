import { getAdminData } from "@/lib/admin-data";
import { dateShort, money, num } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import { confirmTransfer, importTransfers } from "@/app/admin/actions";
import ImportForm from "@/components/app/ImportForm";
import { has } from "@/lib/env";

const eur = (v: number) => money(Math.round(v), "EUR");

export default async function PaymentsPage() {
  const d = await getAdminData();
  return (
    <div>
      <div className="topbar"><div><h1>Încasări</h1><p>Stripe, transferuri bancare și facturi {has.smartbill() ? "SmartBill" : "(SmartBill neconectat)"}. Sume în EUR.</p></div></div>
      <div className="g g-4">
        <div className="panel kpi"><span className="l">Încasat luna aceasta</span><b>{eur(d.collectedEur)}</b><span className="d" style={{ color: "var(--mute)" }}>din {eur(d.scheduledEur)} programat</span></div>
        <div className="panel kpi"><span className="l">Card (Stripe)</span><b>{num(d.cardShare * 100)}%</b><span className="d" style={{ color: "var(--mute)" }}>din volum</span></div>
        <div className="panel kpi"><span className="l">Restanțe</span><b>{eur(d.overdueEur)}</b><span className={`d${d.restants.length ? " n" : ""}`}>{d.restants.length} {d.restants.length === 1 ? "client" : "clienți"}</span></div>
        <div className="panel kpi"><span className="l">Comisioane Stripe</span><b>{eur(d.stripeFees)}</b><span className="d" style={{ color: "var(--mute)" }}>estimat 1,5% + 1 RON</span></div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Transferuri de reconciliat</h3>
        {d.transfers.length ? (
          <div className="tbl"><table>
            <thead><tr><th>Data</th><th>Plătitor (extras)</th><th>Referință</th><th className="r">Sumă</th><th>Potrivire</th><th className="r" /></tr></thead>
            <tbody>
              {d.transfers.map((t) => (
                <tr key={t.id}>
                  <td>{dateShort(t.received_at)}</td><td>{t.payer_name}</td><td className={t.reference ? "mono" : "muted"}>{t.reference ?? "—"}</td><td className="r">{money(+t.amount, t.currency, 2)}</td>
                  {t.match_status === "unmatched" ? (
                    <td colSpan={2}>
                      <form action={confirmTransfer} className="inline-form">
                        <input type="hidden" name="transfer_id" value={t.id} />
                        <select name="installment_id" required defaultValue="" style={{ maxWidth: 320 }}>
                          <option value="" disabled>Alege rata…</option>
                          {d.openInstallments.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                        </select>
                        <button className="btn-plain sm">Confirmă</button>
                      </form>
                    </td>
                  ) : (
                    <><td className="muted">{t.match_status === "auto" ? "Automat" : "Manual"}</td><td className="r"><Pill tone="ok">{t.match_status === "auto" ? "Auto" : "Confirmat"}</Pill></td></>
                  )}
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : <div className="empty">Niciun transfer importat.</div>}
        <div style={{ marginTop: 20 }}><ImportForm action={importTransfers} /></div>
      </div>
    </div>
  );
}
