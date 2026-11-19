"use client";

import { useActionState } from "react";
import { Feedback } from "./forms";

type State = { ok?: string; error?: string } | null;

export default function ImportForm({ action }: { action: (s: State, f: FormData) => Promise<State> }) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form action={run} className="form-dark">
      <div className="fld">
        <label htmlFor="csv">Rânduri din extras · data;plătitor;referință;sumă;monedă</label>
        <textarea id="csv" name="csv" rows={4} placeholder={"18.11.2026;FORMA FITNESS SRL;LNR-0103;471,90;EUR\n17.11.2026;CABINET IONESCU;LNR-0104;543,29;RON"} className="mono" />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn-plain" disabled={pending}>{pending ? "Se importă…" : "Importă și potrivește"}</button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
