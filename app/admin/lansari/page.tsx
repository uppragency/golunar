import { getAdminData } from "@/lib/admin-data";
import { STAGE } from "@/lib/labels";
import { updateLaunch } from "@/app/admin/actions";

export default async function LaunchesPage() {
  const d = await getAdminData();
  return (
    <div>
      <div className="topbar"><div><h1>Lansări în curs</h1><p>SLA: 10 zile lucrătoare. Ceasul se oprește când așteptăm clientul.</p></div></div>
      <div className="panel">
        {d.launches.length ? d.launches.map((l) => {
          const risk = l.day_counter >= 8 || l.sla_paused;
          return (
            <div className="prj" key={l.id} style={{ gridTemplateColumns: "1fr 140px auto" }}>
              <div>{l.companies?.name}<small>{l.websites?.domain} · ziua {l.day_counter}/10 · {STAGE[l.stage]}{l.sla_paused ? ` · pauză: ${l.paused_reason ?? "așteaptă clientul"}` : ""}</small></div>
              <div className="pb"><i className={risk ? "w" : ""} style={{ width: `${Math.min(100, l.day_counter * 10)}%` }} /></div>
              <form action={updateLaunch} className="inline-form">
                <input type="hidden" name="id" value={l.id} />
                <select name="stage" defaultValue={l.stage} aria-label="Etapă">{Object.entries(STAGE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                <input name="day_counter" type="number" min={0} max={30} defaultValue={l.day_counter} style={{ width: 64 }} aria-label="Ziua" />
                <label style={{ fontSize: 12, color: "var(--mute)", display: "flex", gap: 4, alignItems: "center" }}><input type="checkbox" name="sla_paused" defaultChecked={l.sla_paused} />Pauză</label>
                <input name="paused_reason" defaultValue={l.paused_reason ?? ""} placeholder="Motiv" style={{ width: 140 }} />
                <button className="btn-plain sm">Salvează</button>
              </form>
            </div>
          );
        }) : <div className="empty">Nicio lansare în curs.</div>}
      </div>
    </div>
  );
}
