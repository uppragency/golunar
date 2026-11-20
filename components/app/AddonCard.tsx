"use client";

import { useActionState, useState } from "react";
import { activateAddon } from "@/app/cont/actions";

export default function AddonCard({ code, name, desc, price, unit, active, canBuy, maxQty }: { code: string; name: string; desc: string; price: number; unit: string; active: boolean; canBuy: boolean; maxQty?: number }) {
  const [state, action, pending] = useActionState(activateAddon, null);
  const [qty, setQty] = useState(1);
  return (
    <div className={`panel addon-card${active ? " on" : ""}`}>
      <h3>{name}</h3>
      <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 14px" }}>{desc}</p>
      <div className="addon-p"><b>{(price * qty).toLocaleString("ro-RO")} {unit}</b><span>/ lună{code === "brand" ? " · 12 luni" : ""}</span></div>
      {active ? <span className="pill ok"><span className="d" />Activă</span> : state?.ok ? <p className="okmsg">{state.ok}</p> : (
        <form action={action} className="cancel-a">
          <input type="hidden" name="addon" value={code} />
          {maxQty && maxQty > 1 && <select name="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} aria-label="Număr">{Array.from({ length: maxQty }, (_, i) => <option key={i} value={i + 1}>{i + 1} {i ? "limbi" : "limbă"}</option>)}</select>}
          <button className="btn-plain sm acc" disabled={pending || !canBuy}>{pending ? "Se activează…" : "Activează"}</button>
        </form>
      )}
      {!canBuy && !active && <small className="muted" style={{ display: "block", marginTop: 8 }}>Doar owner-ul firmei, cu abonament activ, poate activa opțiuni.</small>}
      {state?.error && <p className="err">{state.error}</p>}
    </div>
  );
}
