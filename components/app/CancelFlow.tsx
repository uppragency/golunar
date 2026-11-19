"use client";

import { useActionState, useState, useTransition } from "react";
import { acceptRetention, cancelWithReason } from "@/app/cont/actions";

const REASONS = ["Prețul este prea mare", "Nu văd rezultate", "Am nevoie de alte funcții", "Am găsit altă soluție", "Închid sau pun pe pauză afacerea", "Nu sunt mulțumit de comunicare", "Alt motiv"];

/** Anulare în doi pași: motiv obligatoriu, apoi oferta de retenție (dacă e activă). */
export default function CancelFlow({ retention }: { retention: { percent: number } | null }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [state, action, pending] = useActionState(cancelWithReason, null);
  const [kept, setKept] = useState<{ ok?: string; error?: string } | null>(null);
  const [keeping, startKeep] = useTransition();

  if (state?.ok) return <p className="okmsg" style={{ marginTop: 10 }}>{state.ok}</p>;
  if (kept?.ok) return <p className="okmsg" style={{ marginTop: 10 }}>{kept.ok}</p>;
  if (step === 0) return <button type="button" className="btn-plain" style={{ width: "100%", color: "var(--mute)" }} onClick={() => setStep(1)}>Anulează abonamentul</button>;

  if (step === 1) return (
    <div className="cancel">
      <b>De ce vrei să anulezi?</b>
      <div className="cancel-r">
        {REASONS.map((r) => <label key={r}><input type="radio" name="cat" checked={category === r} onChange={() => setCategory(r)} />{r}</label>)}
      </div>
      <textarea value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detalii (opțional): ce am putea face mai bine?" maxLength={500} />
      <div className="cancel-a">
        <button type="button" className="btn-plain sm" onClick={() => setStep(0)}>Renunț</button>
        <button type="button" className="btn-plain sm" disabled={!category} onClick={() => (retention ? setStep(2) : document.getElementById("cancel-final")?.click())}>Continuă</button>
      </div>
      <form action={action} hidden><input name="category" value={category} readOnly /><input name="detail" value={detail} readOnly /><button id="cancel-final" /></form>
      {state?.error && <p className="err">{state.error}</p>}
    </div>
  );

  return (
    <div className="cancel offer-box">
      <b>Înainte să pleci: {retention!.percent}% reducere la rata următoare.</b>
      <p className="muted" style={{ fontSize: 13.5, margin: "6px 0 12px" }}>Rămâi cu website-ul actualizat și monitorizat, iar luna viitoare plătești cu {retention!.percent}% mai puțin. Oferta se aplică o singură dată.</p>
      <div className="cancel-a">
        <button type="button" className="btn btn-accent" disabled={keeping} onClick={() => startKeep(async () => setKept(await acceptRetention()))}>{keeping ? "Se aplică…" : "Rămân cu reducerea"}</button>
        <form action={action}><input type="hidden" name="category" value={category} /><input type="hidden" name="detail" value={detail} /><button className="btn-plain sm" disabled={pending}>{pending ? "Se procesează…" : "Anulez oricum"}</button></form>
      </div>
      {(state?.error || kept?.error) && <p className="err">{state?.error || kept?.error}</p>}
    </div>
  );
}
