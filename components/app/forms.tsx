"use client";

import { useActionState, useState, useTransition } from "react";
import { Arrow, Check } from "@/components/site/visuals";

type State = { ok?: string; error?: string } | null;
type Action = (prev: State, form: FormData) => Promise<State>;

export function Feedback({ state }: { state: State }) {
  if (!state) return null;
  return state.error ? <p className="err" role="alert">{state.error}</p> : <p className="okmsg" role="status">{state.ok}</p>;
}

export function RequestForm({ action, remaining, disabled }: { action: Action; remaining: number; disabled?: boolean }) {
  const [state, run, pending] = useActionState(action, null);
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
      <div className="fld"><label htmlFor="rq-title">Titlu</label><input id="rq-title" name="title" required minLength={3} maxLength={160} placeholder="Ex: Adaugă secțiune cu prețuri" /></div>
      <div className="fld"><label htmlFor="rq-body">Detalii</label><textarea id="rq-body" name="body" rows={5} maxLength={5000} placeholder="Descrie ce vrei să schimbăm. Link-uri către fișiere sunt binevenite." /></div>
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
