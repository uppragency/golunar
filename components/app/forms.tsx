"use client";

import { useActionState, useState, useTransition } from "react";
import { Arrow, Check } from "@/components/site/visuals";

type State = { ok?: string; error?: string } | null;
type Action = (prev: State, form: FormData) => Promise<State>;

export function Feedback({ state }: { state: State }) {
  if (!state) return null;
  return state.error ? <p className="err" role="alert">{state.error}</p> : <p className="okmsg" role="status">{state.ok}</p>;
}

export function RequestForm({ action, remaining, disabled, companyId, preset }: { action: Action; remaining: number; disabled?: boolean; companyId?: string; preset?: { title: string; body: string } }) {
  const [state, run, pending] = useActionState(action, null);
  const [files, setFiles] = useState<{ path: string; name: string; size: number }[]>([]);
  const [up, setUp] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);
  const onFiles = async (list: FileList | null) => {
    if (!list || !companyId) return;
    setUp(true); setUpErr(null);
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    const added: typeof files = [];
    for (const f of Array.from(list).slice(0, 5 - files.length)) {
      if (f.size > 10 * 1024 * 1024) { setUpErr(`${f.name} depășește 10 MB.`); continue; }
      const safe = f.name.normalize("NFKD").replace(/[^\w.-]+/g, "-").slice(-80);
      const path = `${companyId}/requests/${Date.now()}-${safe}`;
      const { error } = await sb.storage.from("documents").upload(path, f, { contentType: f.type, upsert: false });
      if (error) setUpErr("Fișierul nu a putut fi încărcat."); else added.push({ path, name: f.name, size: f.size });
    }
    setFiles((x) => [...x, ...added]); setUp(false);
  };
  return (
    <form action={run} className="form-dark">
      <div className="fld">
        <label htmlFor="rq-type">Tip</label>
        <select id="rq-type" name="type" defaultValue={remaining > 0 ? "improvement" : "bug"}>
          <option value="improvement" disabled={remaining <= 0}>Îmbunătățire ({remaining} {remaining === 1 ? "rămasă" : "rămase"} luna aceasta)</option>
          <option value="bug">Problemă tehnică</option>
          <option value="billing">Întrebare facturare</option>
        </select>
      </div>
      <div className="fld"><label htmlFor="rq-title">Titlu</label><input id="rq-title" name="title" required minLength={3} maxLength={160} defaultValue={preset?.title} key={preset?.title} placeholder="Ex: Adaugă secțiune cu prețuri" /></div>
      <div className="fld"><label htmlFor="rq-page">Pe ce pagină? <span className="muted">(opțional)</span></label><input id="rq-page" name="page" maxLength={300} placeholder="Ex: golunar.ro/servicii sau „pagina principală, secțiunea de prețuri”" /></div>
      <div className="fld"><label htmlFor="rq-body">Detalii</label><textarea id="rq-body" name="body" rows={5} maxLength={5000} defaultValue={preset?.body} key={preset?.body} placeholder="Descrie ce vrei să schimbăm. Dacă ai o captură de ecran, încercuiește pe ea zona și atașeaz-o mai jos." /></div>
      {companyId && (
        <div className="fld">
          <label htmlFor="rq-files">Capturi de ecran sau fișiere <span className="muted">(max. 5, 10 MB fiecare)</span></label>
          <input id="rq-files" type="file" multiple accept="image/*,.pdf,.doc,.docx" disabled={up || files.length >= 5} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
          {up && <small className="muted">Se încarcă…</small>}
          {upErr && <small className="err">{upErr}</small>}
          {files.length > 0 && <div className="rq-files">{files.map((f) => <span key={f.path}>{f.name}<button type="button" onClick={() => setFiles((x) => x.filter((y) => y.path !== f.path))} aria-label="Elimină">×</button></span>)}</div>}
          <input type="hidden" name="attachments" value={JSON.stringify(files)} />
        </div>
      )}
      <Feedback state={state} />
      <button className="btn btn-accent" disabled={pending || disabled} style={{ marginTop: 6 }}>
        <span className="ic"><Arrow size={16} /></span>{pending ? "Se trimite…" : "Trimite cererea"}
      </button>
    </form>
  );
}

export function SaveForm({ action, children, label = "Salvează", disabled }: { action: Action; children: React.ReactNode; label?: string; disabled?: boolean }) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form action={run}>
      <fieldset disabled={disabled || pending} style={{ border: 0 }}>{children}</fieldset>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
        <button className="btn btn-accent" disabled={pending || disabled}><span className="ic"><Check /></span>{pending ? "Se salvează…" : label}</button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

/** Button that runs a no-arg server action after a native confirm. */
export function ConfirmAction({ action, label, confirm, className = "btn-plain", style }: {
  action: () => Promise<State>; label: string; confirm?: string; className?: string; style?: React.CSSProperties;
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<State>(null);
  return (
    <>
      <button type="button" className={className} style={style} disabled={pending}
        onClick={() => { if (confirm && !window.confirm(confirm)) return; start(async () => setState(await action())); }}>
        {pending ? "Se procesează…" : label}
      </button>
      <Feedback state={state} />
    </>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); }}>
      {done ? "Copiat" : "Copiază"}
    </button>
  );
}
