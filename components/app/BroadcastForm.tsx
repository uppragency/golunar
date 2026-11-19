"use client";

import { useActionState, useState } from "react";
import { sendBroadcast } from "@/app/admin/actions";

export default function BroadcastForm({ audiences }: { audiences: { value: string; label: string; count: number }[] }) {
  const [state, action, pending] = useActionState(sendBroadcast, null);
  const [aud, setAud] = useState(audiences[0]?.value ?? "active");
  const n = audiences.find((a) => a.value === aud)?.count ?? 0;
  return (
    <form action={action} className="bc">
      <label>Destinatari<select name="audience" value={aud} onChange={(e) => setAud(e.target.value)}>{audiences.map((a) => <option key={a.value} value={a.value}>{a.label} · {a.count}</option>)}</select></label>
      <label>Subiect<input name="subject" required maxLength={150} placeholder="Ex: Mentenanță programată sâmbătă, 07:00–08:00" /></label>
      <label>Mesaj<textarea name="body" required rows={9} maxLength={8000} placeholder={"Bună ziua,\n\nScrie mesajul aici. Paragrafele se separă cu un rând liber."} /></label>
      <label className="check"><input type="checkbox" name="confirm" />Confirm trimiterea către {n} {n === 1 ? "client" : "clienți"}</label>
      <button className="btn btn-accent" disabled={pending || !n}>{pending ? "Se trimite…" : `Trimite către ${n}`}</button>
      {state?.error && <p className="err">{state.error}</p>}
      {state?.ok && <p className="okmsg">{state.ok}</p>}
    </form>
  );
}
