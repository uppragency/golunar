import { getOps, LEAD_STATUS, SOURCE_LABEL } from "@/lib/admin-ops";
import { date } from "@/lib/format";
import { PLAN_NAME } from "@/lib/labels";
import { sendLeadOffer, updateLead } from "@/app/admin/actions";
import { Pill } from "@/components/app/charts";

export const metadata = { title: "Lead-uri" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const d = await getOps();
  const { s = "open" } = await searchParams;
  const list = d.leads.filter((l) => l.source !== "checkout").filter((l) => (s === "all" ? true : s === "open" ? l.status === "new" || l.status === "contacted" : l.status === s));
  const count = (k: string) => d.leads.filter((l) => l.source !== "checkout" && (k === "open" ? l.status === "new" || l.status === "contacted" : k === "all" ? true : l.status === k)).length;
  return (
    <div>
      <div className="topbar"><div><h1>Lead-uri</h1><p>Audit gratuit, discuții programate și recomandări. Sursa este prima vizită (UTM, Google, Facebook sau site-ul de proveniență).</p></div></div>
      <div className="g g-21">
        <div>
          <div className="filters" style={{ marginBottom: 12 }}>
            {[["open", "Deschise"], ["new", "Noi"], ["contacted", "Contactați"], ["won", "Câștigați"], ["lost", "Pierduți"], ["all", "Toți"]].map(([k, l]) => (
              <a key={k} href={`?s=${k}`} className={s === k ? "on" : ""}>{l} · {count(k)}</a>
            ))}
          </div>
          <div className="panel">
            {list.length ? list.map((l) => (
              <div className="lrow" key={l.id}>
                <div className="lead-h">
                  <div><b>{l.name}</b>{l.company ? ` · ${l.company}` : ""}<small>{SOURCE_LABEL[l.source] ?? l.source} · {date(l.createdAt, { day: "numeric", month: "short" })} · sursă {l.channel}{l.medium ? `/${l.medium}` : ""}{l.campaign ? ` · ${l.campaign}` : ""}{l.ref ? ` · recomandare ${l.ref}` : ""}</small></div>
                  <Pill tone={LEAD_STATUS[l.status][1]}>{LEAD_STATUS[l.status][0]}</Pill>
                </div>
                <div className="lead-c">
                  <a href={`mailto:${l.email}`}>{l.email}</a>{l.phone && <a href={`tel:${l.phone.replace(/\s/g, "")}`}>{l.phone}</a>}{l.plan && <span>Plan: {PLAN_NAME[l.plan]}</span>}{l.url && <a href={l.url} target="_blank" rel="noopener">{l.url.replace(/^https?:\/\//, "")}</a>}
                </div>
                {l.message && <p className="lead-m">{l.message}</p>}
                {(l.status === "new" || l.status === "contacted") && (
                  <details className="offer">
                    <summary>Trimite ofertă personalizată</summary>
                    <form action={sendLeadOffer} className="inline-form">
                      <input type="hidden" name="lead_id" value={l.id} />
                      <select name="plan" defaultValue={l.plan ?? "growth"} aria-label="Plan">{Object.entries(PLAN_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                      <select name="percent" defaultValue="20" aria-label="Reducere">{[10, 15, 20, 25, 30, 40, 50].map((v) => <option key={v} value={v}>{v}% reducere</option>)}</select>
                      <select name="months" defaultValue="1" aria-label="Luni">{[1, 2, 3].map((v) => <option key={v} value={v}>{v === 1 ? "prima lună" : `primele ${v} luni`}</option>)}</select>
                      <button className="btn-plain sm acc">Trimite (72h)</button>
                    </form>
                  </details>
                )}
                <form action={updateLead} className="inline-form">
                  <input type="hidden" name="id" value={l.id} />
                  <select name="status" defaultValue={l.status} aria-label="Status">{Object.entries(LEAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
                  <input name="note" defaultValue={l.note ?? ""} placeholder="Notiță" style={{ flex: 1, minWidth: 160 }} aria-label="Notiță" />
                  <button className="btn-plain sm">Salvează</button>
                </form>
              </div>
            )) : <div className="empty">Niciun lead aici.</div>}
          </div>
        </div>
        <div className="panel">
          <h3>Surse · toate lead-urile și comenzile</h3>
          {d.sources.length ? d.sources.map((x) => (
            <div className="kv" key={x.source}><span>{x.source}</span><b>{x.leads} <span className="muted" style={{ fontWeight: 400 }}>· {x.won} conversii</span></b></div>
          )) : <div className="empty">Încă nu sunt date.</div>}
          <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>Conversie = lead câștigat sau comandă plasată. Sursele se înregistrează de pe 20 noiembrie 2026.</p>
        </div>
      </div>
    </div>
  );
}
