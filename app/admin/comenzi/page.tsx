import Link from "next/link";
import { getOps } from "@/lib/admin-ops";
import { money, date } from "@/lib/format";
import { PLAN_NAME } from "@/lib/labels";
import { cancelOrder, markInstallmentPaid, sendOrderReminder } from "@/app/admin/actions";
import { Pill } from "@/components/app/charts";

export const metadata = { title: "Comenzi neplătite" };

export default async function OrdersPage() {
  const d = await getOps();
  const total = d.orders.reduce((a, o) => a + (o.currency === "EUR" ? o.amount * 5.09 : o.amount), 0);
  return (
    <div>
      <div className="topbar">
        <div><h1>Comenzi neplătite</h1><p>Transfer bancar. Reamintire automată în ziua 2 și 5, expirare în ziua 10. {d.expired ? `${d.expired} expirate în ultimele 30 de zile.` : ""}</p></div>
      </div>
      <div className="g g-3">
        <div className="panel kpi"><span className="l">În așteptare</span><b>{d.orders.length}</b><span className="d" style={{ color: "var(--mute)" }}>comenzi</span></div>
        <div className="panel kpi"><span className="l">Valoare prima rată</span><b>{money(Math.round(total), "RON")}</b><span className="d" style={{ color: "var(--mute)" }}>de încasat</span></div>
        <div className="panel kpi"><span className="l">Expiră în 3 zile</span><b>{d.orders.filter((o) => o.expiresIn <= 3).length}</b><span className={`d${d.orders.some((o) => o.expiresIn <= 3) ? " n" : ""}`}>sună clientul</span></div>
      </div>
      <div className="panel" style={{ marginTop: 12 }}>
        {d.orders.length ? d.orders.map((o) => (
          <div className="ord" key={o.subId}>
            <div className="ord-main">
              <b>{o.name}</b>
              <small>{o.reference} · {PLAN_NAME[o.plan]} · CUI {o.cui} · comandă {date(o.createdAt, { day: "numeric", month: "short" })}</small>
              <small>{o.rep}{o.email ? ` · ${o.email}` : ""}{o.phone ? ` · ${o.phone}` : ""}</small>
            </div>
            <div className="ord-amt"><b>{money(o.amount, o.currency, 2)}</b><small>ziua {o.age} din 10 · {o.reminders} {o.reminders === 1 ? "reamintire" : "reamintiri"}</small></div>
            <Pill tone={o.expiresIn <= 3 ? "bad" : o.age >= 2 ? "warn" : "acc"}>{o.expiresIn === 0 ? "Expiră azi" : `Expiră în ${o.expiresIn} ${o.expiresIn === 1 ? "zi" : "zile"}`}</Pill>
            <div className="ord-act">
              {o.installmentId && (
                <form action={markInstallmentPaid}><input type="hidden" name="id" value={o.installmentId} /><input type="hidden" name="method" value="Transfer" /><button className="btn-plain sm acc">Confirmă plata</button></form>
              )}
              <form action={sendOrderReminder}>
                <input type="hidden" name="company_id" value={o.companyId} /><input type="hidden" name="amount" value={o.amount} /><input type="hidden" name="days_left" value={o.expiresIn} />
                <button className="btn-plain sm">Reamintire</button>
              </form>
              {o.phone && <a className="btn-plain sm" href={`tel:${o.phone.replace(/\s/g, "")}`}>Sună</a>}
              <form action={cancelOrder}><input type="hidden" name="sub_id" value={o.subId} /><button className="btn-plain sm danger">Anulează</button></form>
              <Link className="btn-plain sm" href={`/admin/clienti/${o.companyId}`}>Fișă</Link>
            </div>
          </div>
        )) : <div className="empty">Nicio comandă în așteptarea plății.</div>}
      </div>
    </div>
  );
}
