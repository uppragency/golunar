import { getPortalData } from "@/lib/portal-data";
import { date } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import { RequestForm } from "@/components/app/forms";
import { createRequest } from "@/app/cont/actions";
import { REQ_PILL, REQ_TYPE } from "@/lib/labels";

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ ok?: string; titlu?: string; detalii?: string }> }) {
  const { ok, titlu, detalii } = await searchParams;
  const preset = titlu ? { title: titlu.slice(0, 160), body: (detalii ?? "").slice(0, 2000) } : undefined;
  const d = await getPortalData();
  if (!d.ready) return null;
  return (
    <div>
      <div className="topbar"><div><h1>Cereri și suport</h1><p>Răspuns în maximum 48 de ore lucrătoare. O îmbunătățire înseamnă maximum 2 ore de lucru.</p></div></div>
      {ok === "buyout" && <div className="lead-ok" style={{ marginBottom: 12 }}>Am primit cererea de răscumpărare. Îți trimitem link-ul de plată pe email.</div>}
      <div className="g g-2">
        <div className="panel">
          <h3>Cerere nouă</h3>
          {d.ctx.canEdit ? <RequestForm action={createRequest} remaining={Math.max(0, d.quota - d.usedThisMonth)} companyId={d.company.id} preset={preset} /> : <div className="empty">Rolul tău este doar de citire.</div>}
        </div>
        <div className="panel">
          <h3>Istoric</h3>
          {d.requests.length ? d.requests.map((r) => (
            <div className="req" key={r.id}>
              <div>{r.title}<small>{date(r.created_at, { day: "numeric", month: "short" })} · {REQ_TYPE[r.type]}{(r.attachments as unknown[] | null)?.length ? ` · ${(r.attachments as unknown[]).length} atașamente` : ""}{r.delivered_at ? ` · livrată ${date(r.delivered_at, { day: "numeric", month: "short" })}` : ""}</small></div>
              <Pill tone={REQ_PILL[r.status][0]}>{REQ_PILL[r.status][1]}</Pill>
            </div>
          )) : <div className="empty">Nicio cerere încă.</div>}
        </div>
      </div>
    </div>
  );
}
