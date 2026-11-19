"use client";

import { useEffect, useRef, useState } from "react";
import type { Discount } from "@/lib/discount";
import type { PlanCode } from "@/lib/plans";

/** Câmp pentru cod de reducere. Revalidează automat când se schimbă planul. */
export function DiscountField({ plan, value, onChange, tone = "dark", initial }: {
  plan: PlanCode;
  value: Discount | null;
  onChange: (d: Discount | null) => void;
  tone?: "dark" | "light";
  initial?: string | null;
}) {
  const [open, setOpen] = useState(!!initial);
  const [code, setCode] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const tried = useRef<string | null>(null);

  async function apply(c = code) {
    const v = c.trim().toUpperCase();
    if (v.length < 3) return setErr("Introdu codul.");
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/discount", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: v, plan }) });
      const j = await r.json().catch(() => ({}));
      if (!j.valid) {
        onChange(null);
        setErr(j.error || "Codul nu este valid.");
      } else {
        onChange({ id: j.id, code: j.code, kind: j.kind, percent: j.percent != null ? +j.percent : null, amount_ron: j.amount_ron != null ? +j.amount_ron : null, amount_eur: j.amount_eur != null ? +j.amount_eur : null, months: j.months, description: null });
      }
    } catch {
      setErr("Nu am putut verifica codul.");
    } finally {
      setBusy(false);
    }
  }

  // cod din URL (?cod=) sau revalidare la schimbarea planului
  useEffect(() => {
    const c = value?.code ?? (initial && tried.current !== `${initial}:${plan}` ? initial : null);
    if (!c) return;
    tried.current = `${c}:${plan}`;
    apply(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, initial]);

  if (value) {
    return (
      <div className={`disc on ${tone}`}>
        <span className="disc-tag">{value.code}</span>
        <button type="button" className="disc-x" onClick={() => { onChange(null); setCode(""); setErr(null); }} aria-label="Elimină codul">Elimină</button>
      </div>
    );
  }
  if (!open) return <button type="button" className={`disc-open ${tone}`} onClick={() => setOpen(true)}>Ai un cod de reducere?</button>;
  return (
    <div className={`disc ${tone}`}>
      <div className="disc-row">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
          placeholder="Cod de reducere" aria-label="Cod de reducere" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={24} />
        <button type="button" onClick={() => apply()} disabled={busy}>{busy ? "…" : "Aplică"}</button>
      </div>
      {err && <p className="disc-err" role="alert">{err}</p>}
    </div>
  );
}
