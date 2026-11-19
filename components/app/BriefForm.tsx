"use client";

import { useActionState, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BRIEF_MAX_FILES, BRIEF_MAX_MB, BRIEF_SECTIONS } from "@/lib/brief";
import { Feedback } from "./forms";

type State = { ok?: string; error?: string } | null;
type FileRef = { path: string; name: string; size: number };

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
const safe = (n: string) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);

export default function BriefForm({ action, companyId, initial, submittedAt, disabled }: {
  action: (s: State, f: FormData) => Promise<State>;
  companyId: string;
  initial: { answers: Record<string, string>; description: string | null; examples: string | null; files: FileRef[] } | null;
  submittedAt: string | null;
  disabled?: boolean;
}) {
  const [state, run, pending] = useActionState(action, null);
  const [files, setFiles] = useState<FileRef[]>(initial?.files ?? []);
  const [up, setUp] = useState<string | null>(null);
  const [upErr, setUpErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const a = initial?.answers ?? {};

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setUpErr(null);
    const sb = createClient();
    const added: FileRef[] = [];
    for (const f of Array.from(list)) {
      if (files.length + added.length >= BRIEF_MAX_FILES) { setUpErr(`Maximum ${BRIEF_MAX_FILES} fișiere.`); break; }
      if (!f.type.startsWith("image/") && f.type !== "application/pdf") { setUpErr(`${f.name}: acceptăm imagini și PDF.`); continue; }
      if (f.size > BRIEF_MAX_MB * 1024 * 1024) { setUpErr(`${f.name}: maximum ${BRIEF_MAX_MB} MB.`); continue; }
      setUp(f.name);
      const path = `${companyId}/brief/${Date.now().toString(36)}-${safe(f.name)}`;
      const { error } = await sb.storage.from("documents").upload(path, f, { contentType: f.type, upsert: false });
      if (error) setUpErr(`${f.name}: încărcarea a eșuat.`);
      else added.push({ path, name: f.name, size: f.size });
    }
    setUp(null);
    setFiles((cur) => [...cur, ...added]);
    if (input.current) input.current.value = "";
  }

  async function remove(f: FileRef) {
    setFiles((cur) => cur.filter((x) => x.path !== f.path));
    await createClient().storage.from("documents").remove([f.path]).catch(() => {});
  }

  return (
    <form action={run} className="brief form-dark">
      <fieldset disabled={disabled || pending} style={{ border: 0, minWidth: 0 }}>
        {BRIEF_SECTIONS.map((sec, si) => (
          <section className="panel brief-sec" key={sec.title}>
            <div className="brief-head"><span className="mono">0{si + 1}</span><div><h3>{sec.title}</h3><p>{sec.lead}</p></div></div>
            <div className="brief-grid">
              {sec.qs.map((q) => (
                <div className={`fld${q.kind === "area" || q.kind === "multi" ? " wide" : ""}`} key={q.key}>
                  <label htmlFor={`b-${q.key}`}>{q.label}{q.required && <em> *</em>}</label>
                  {q.hint && <small>{q.hint}</small>}
                  {q.kind === "text" && <input id={`b-${q.key}`} name={q.key} defaultValue={a[q.key] ?? ""} maxLength={600} />}
                  {q.kind === "area" && <textarea id={`b-${q.key}`} name={q.key} defaultValue={a[q.key] ?? ""} rows={3} maxLength={4000} />}
                  {q.kind === "select" && (
                    <select id={`b-${q.key}`} name={q.key} defaultValue={a[q.key] ?? ""}>
                      <option value="">Alege</option>
                      {q.options!.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  )}
                  {q.kind === "multi" && (
                    <div className="brief-chips" id={`b-${q.key}`}>
                      {q.options!.map((o) => (
                        <label key={o} className="chip"><input type="checkbox" name={q.key} value={o} defaultChecked={(a[q.key] ?? "").split(", ").includes(o)} /><span>{o}</span></label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="panel brief-sec">
          <div className="brief-head"><span className="mono">03</span><div><h3>Descrie site-ul pe care îl vrei</h3><p>Orice crezi că trebuie să știm: idei, ce nu îți place la site-ul actual, oferte, detalii despre clienți.</p></div></div>
          <div className="fld wide">
            <label htmlFor="b-description">Descriere</label>
            <textarea id="b-description" name="description" className="brief-big" defaultValue={initial?.description ?? ""} maxLength={20000} placeholder="Scrie liber. Cu cât mai multe detalii, cu atât prima variantă e mai aproape de ce îți dorești." />
          </div>
          <div className="fld wide">
            <label htmlFor="b-examples">Site-uri exemple</label>
            <small>Câte un link pe rând și ce îți place la fiecare.</small>
            <textarea id="b-examples" name="examples" rows={4} defaultValue={initial?.examples ?? ""} maxLength={3000} placeholder={"https://exemplu.ro · îmi plac culorile și meniul\nhttps://altexemplu.com · îmi place cum prezintă serviciile"} />
          </div>
          <div className="fld wide">
            <label>Poze și materiale</label>
            <small>Logo, poze cu echipa, locația, produsele sau lucrările. Imagini sau PDF, maximum {BRIEF_MAX_MB} MB fiecare, {BRIEF_MAX_FILES} fișiere.</small>
            <label className={`drop${up ? " busy" : ""}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
              <input ref={input} type="file" multiple accept="image/*,application/pdf" onChange={(e) => onFiles(e.target.files)} />
              <b>{up ? `Se încarcă ${up}…` : "Trage fișierele aici sau apasă pentru a alege"}</b>
              <span>{files.length} / {BRIEF_MAX_FILES} fișiere încărcate</span>
            </label>
            {upErr && <p className="err" role="alert">{upErr}</p>}
            {files.length > 0 && (
              <ul className="files">
                {files.map((f) => (
                  <li key={f.path}><span>{f.name}</span><small>{kb(f.size)}</small><button type="button" onClick={() => remove(f)} aria-label={`Șterge ${f.name}`}>Șterge</button></li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <input type="hidden" name="files" value={JSON.stringify(files)} />
      </fieldset>

      <div className="brief-bar">
        <Feedback state={state} />
        <div className="brief-actions">
          <button className="btn-plain" name="intent" value="draft" disabled={disabled || pending || !!up}>Salvează ciorna</button>
          <button className="btn btn-accent" name="intent" value="submit" disabled={disabled || pending || !!up}><span className="ic">→</span>{pending ? "Se trimite…" : submittedAt ? "Trimite actualizarea" : "Trimite brief-ul"}</button>
        </div>
      </div>
    </form>
  );
}
