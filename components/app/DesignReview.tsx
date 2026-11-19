"use client";

import { useActionState, useState } from "react";
import { decideDesign } from "@/app/cont/actions";

export default function DesignReview({ url }: { url: string }) {
  const [state, action, pending] = useActionState(decideDesign, null);
  const [changes, setChanges] = useState(false);
  if (state?.ok) return <div className="panel design-r"><b>{state.ok}</b></div>;
  return (
    <div className="panel design-r">
      <div className="eyebrow">Design gata de aprobat</div>
      <h3 style={{ margin: "10px 0 6px" }}>Vezi propunerea de design și spune-ne ce crezi.</h3>
      <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>Aprobarea pornește dezvoltarea. Dacă vrei schimbări, descrie-le pe scurt și revenim cu varianta nouă.</p>
      <a className="btn btn-accent" href={url} target="_blank" rel="noopener">Deschide designul ↗</a>
      <form action={action} className="design-f">
        {changes && <textarea name="feedback" required minLength={5} maxLength={4000} placeholder="Ce ai vrea să schimbăm? Ex: culori mai deschise, altă poză în prima secțiune." />}
        <div className="cancel-a">
          {!changes && <button className="btn-plain sm acc" name="decision" value="approved" disabled={pending}>Aprob designul</button>}
          {changes ? <button className="btn-plain sm" name="decision" value="changes" disabled={pending}>Trimite ajustările</button> : <button type="button" className="btn-plain sm" onClick={() => setChanges(true)}>Cer ajustări</button>}
        </div>
      </form>
      {state?.error && <p className="err">{state.error}</p>}
    </div>
  );
}
