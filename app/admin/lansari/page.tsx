import Link from "next/link";
import { getOps, STAGES, type Stage } from "@/lib/admin-ops";
import { date } from "@/lib/format";
import { moveStage, sendBriefReminder, sendDesign, setPause, toggleChecklist } from "@/app/admin/actions";
import { CHECKLIST } from "@/lib/checklist";

export const metadata = { title: "Producție" };

const next: Record<Stage, Stage | null> = { brief: "design", design: "build", build: "qa", qa: "live", live: null };
const prev: Record<Stage, Stage | null> = { brief: null, design: "brief", build: "design", qa: "build", live: "qa" };
const label = (s: Stage | null) => STAGES.find((x) => x.key === s)?.label ?? "";

export default async function ProductionPage() {
  const d = await getOps();
  const late = d.production.filter((p) => p.tone === "bad").length;
  const soon = d.production.filter((p) => p.tone === "warn").length;
  return (
    <div>
      <div className="topbar">
        <div><h1>Producție</h1><p>10 zile lucrătoare de la brief-ul complet. Galben: 3 zile rămase. Roșu: termen depășit, luna următoare devine gratuită automat.</p></div>
        <div className="tb-r"><span className="pill bad"><span className="d" />{late} întârziate</span><span className="pill warn"><span className="d" />{soon} aproape de termen</span></div>
      </div>
      <div className="board">
        {STAGES.map((st) => {
          const items = d.production.filter((p) => p.stage === st.key);
          return (
            <section className="col" key={st.key}>
              <h3>{st.label}<span>{items.length}</span></h3>
              {items.map((p) => (
                <article className={`job ${p.tone}`} key={p.id}>
                  <Link href={`/admin/clienti/${p.companyId}`}><b>{p.name}</b></Link>
                  <small>{p.domain}</small>
                  {p.stage === "brief" ? (
                    <>
                      <div className="job-meta">{p.paidAt ? `Plătit acum ${Math.floor(p.briefHours / 24)} ${Math.floor(p.briefHours / 24) === 1 ? "zi" : "zile"}` : "Plată neconfirmată"} · {p.briefReminders} reamintiri</div>
                      <div className="job-meta">Termenul pornește la trimiterea brief-ului.</div>
                      <form action={sendBriefReminder}><input type="hidden" name="company_id" value={p.companyId} /><button className="btn-plain sm">Trimite reamintire</button></form>
                    </>
                  ) : p.stage === "live" ? (
                    <div className="job-meta">Lansat · {p.used} zile lucrătoare{p.freeMonth ? " · lună gratuită acordată" : ""}</div>
                  ) : (
                    <>
                      <div className="job-meta">
                        {p.paused ? `Pauză: ${p.reason}` : p.left == null ? "Fără termen: brief-ul nu a fost trimis" : p.left < 0 ? `Depășit cu ${-p.left} ${p.left === -1 ? "zi" : "zile"}` : `${p.left} ${p.left === 1 ? "zi rămasă" : "zile rămase"}`}{p.due ? ` · termen ${date(p.due, { day: "numeric", month: "short" })}` : ""}
                      </div>
                      <div className="job-bar"><i style={{ width: `${Math.min(100, (p.used / 10) * 100)}%` }} /></div>
                      <div className="job-meta">Ziua {p.used}/10 · în etapă de {p.stageSince} {p.stageSince === 1 ? "zi" : "zile"}{p.freeMonth ? " · lună gratuită acordată" : ""}</div>
                    </>
                  )}
                  {p.stage === "design" && (
                    <div className="dsg">
                      {p.designStatus === "pending" && <div className="job-meta">Trimis spre aprobare{p.designSentAt ? ` pe ${date(p.designSentAt, { day: "numeric", month: "short" })}` : ""} · așteptăm clientul</div>}
                      {p.designStatus === "approved" && <div className="job-meta" style={{ color: "#3DD68C" }}>Design aprobat de client ✓</div>}
                      {p.designStatus === "changes" && <div className="job-meta" style={{ color: "#F5B83D" }}>Ajustări cerute: „{p.designFeedback}”</div>}
                      <form action={sendDesign} className="job-pause">
                        <input type="hidden" name="id" value={p.id} />
                        <input name="url" type="url" required placeholder="Link design (Figma, preview)" defaultValue={p.designUrl ?? ""} aria-label="Link design" />
                        <button className="btn-plain sm">{p.designStatus ? "Retrimite" : "Trimite"}</button>
                      </form>
                    </div>
                  )}
                  {p.stage === "qa" && (
                    <div className="chk">
                      <div className="job-meta">Checklist de lansare · {CHECKLIST.filter(([k]) => p.checklist[k]).length}/{CHECKLIST.length}</div>
                      {CHECKLIST.map(([k, t]) => (
                        <form action={toggleChecklist} key={k}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="key" value={k} /><input type="hidden" name="on" value={p.checklist[k] ? "0" : "1"} />
                          <button className={p.checklist[k] ? "on" : ""}><i>{p.checklist[k] ? "✓" : ""}</i>{t}</button>
                        </form>
                      ))}
                    </div>
                  )}
                  <div className="job-act">
                    {prev[p.stage] && p.stage !== "design" && <form action={moveStage}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="stage" value={prev[p.stage]!} /><button className="btn-plain sm" title={`Înapoi la ${label(prev[p.stage])}`}>←</button></form>}
                    {next[p.stage] && p.stage !== "brief" && (p.stage !== "qa" || CHECKLIST.every(([k]) => p.checklist[k])) && <form action={moveStage}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="stage" value={next[p.stage]!} /><button className="btn-plain sm acc">{label(next[p.stage])} →</button></form>}
                    {p.stage !== "brief" && p.stage !== "live" && (
                      <form action={setPause} className="job-pause">
                        <input type="hidden" name="id" value={p.id} /><input type="hidden" name="paused" value={p.paused ? "0" : "1"} />
                        {!p.paused && <input name="reason" placeholder="Motiv pauză" aria-label="Motiv pauză" />}
                        <button className="btn-plain sm">{p.paused ? "Reia" : "Pauză"}</button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
              {!items.length && <div className="empty sm">—</div>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
