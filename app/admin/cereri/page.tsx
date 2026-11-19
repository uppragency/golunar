import { getAdminData } from "@/lib/admin-data";
import { date } from "@/lib/format";
import { REQ_PILL, REQ_TYPE } from "@/lib/labels";
import { updateRequest } from "@/app/admin/actions";
import { Pill } from "@/components/app/charts";

export default async function RequestsAdmin() {
  const d = await getAdminData();
  const open = d.requests.filter((r) => r.status === "new" || r.status === "in_progress");
  const done = d.requests.filter((r) => !(r.status === "new" || r.status === "in_progress")).slice(0, 30);
  const Row = ({ r }: { r: (typeof d.requests)[number] }) => (
    <div className="req" style={{ gridTemplateColumns: "1fr auto" }}>
      <div>{(r.companies as unknown as { name: string } | null)?.name} · {r.title}<small>{REQ_TYPE[r.type]} · {date(r.created_at, { day: "numeric", month: "short" })}</small></div>
      <form action={updateRequest} className="inline-form">
        <input type="hidden" name="id" value={r.id} />
        <select name="status" defaultValue={r.status} aria-label="Status">{Object.entries(REQ_PILL).map(([k, v]) => <option key={k} value={k}>{v[1]}</option>)}</select>
        <input name="hours_spent" type="number" step="0.25" min={0} max={40} defaultValue={r.hours_spent ?? ""} placeholder="ore" style={{ width: 70 }} aria-label="Ore" />
        <button className="btn-plain sm">Salvează</button>
      </form>
    </div>
  );
  return (
    <div>
      <div className="topbar"><div><h1>Cereri</h1><p>{open.length} deschise · răspuns în maximum 48h lucrătoare · îmbunătățire = maximum 2 ore.</p></div></div>
      <div className="panel"><h3>Deschise</h3>{open.length ? open.map((r) => <Row r={r} key={r.id} />) : <div className="empty">Nicio cerere deschisă.</div>}</div>
      <div className="panel" style={{ marginTop: 12 }}>
        <h3>Închise recent</h3>
        {done.map((r) => (
          <div className="req" key={r.id}><div>{(r.companies as unknown as { name: string } | null)?.name} · {r.title}<small>{REQ_TYPE[r.type]} · {r.hours_spent ? `${r.hours_spent} h` : "—"}</small></div><Pill tone={REQ_PILL[r.status][0]}>{REQ_PILL[r.status][1]}</Pill></div>
        ))}
      </div>
    </div>
  );
}
