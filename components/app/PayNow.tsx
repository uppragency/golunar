"use client";

import { useState, useTransition } from "react";
import { notifyPayment } from "@/app/cont/actions";
import { CopyButton } from "@/components/app/forms";

/** Plata ratei: toate datele de transfer, copiate dintr-un click, plus „Am plătit”. */
export default function PayNow({ installmentId, number, amount, due, payee, iban, bank, details, notified }: {
  installmentId: string; number: number; amount: string; due: string; payee: string; iban: string; bank: string; details: string; notified: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<{ ok?: string; error?: string } | null>(notified ? { ok: "Ai anunțat plata. O confirmăm după ce apare în extras." } : null);
  const [pending, start] = useTransition();
  const all = `Beneficiar: ${payee}\nIBAN: ${iban}\nBanca: ${bank}\nSuma: ${amount}\nDetalii plată: ${details}`;
  return (
    <div className="panel paynow">
      <div className="paynow-h">
        <div><span className="eyebrow">Rata {number} din 12</span><b>{amount}</b><small>scadentă pe {due}</small></div>
        <button type="button" className="btn btn-accent" onClick={async () => { try { await navigator.clipboard.writeText(all); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {} }}>{copied ? "Copiat ✓" : "Copiază toate datele"}</button>
      </div>
      <div className="bank-box">
        {([["Beneficiar", payee], ["IBAN", iban], ["Suma", amount], ["Detalii plată", details]] as const).map(([k, v]) => (
          <div className="bank-row" key={k}><span>{k}</span><b className={k === "IBAN" || k === "Detalii plată" ? "mono" : undefined}>{v}</b><CopyButton text={v} /></div>
        ))}
      </div>
      <ol className="paynow-steps"><li>Apasă „Copiază toate datele”.</li><li>Deschide aplicația băncii și lipește datele într-un transfer nou.</li><li>După plată, apasă „Am plătit”: confirmăm mai repede.</li></ol>
      {state?.ok ? <p className="okmsg">{state.ok}</p> : (
        <button type="button" className="btn-plain" disabled={pending} onClick={() => start(async () => setState(await notifyPayment(installmentId)))}>{pending ? "Se trimite…" : "Am plătit"}</button>
      )}
      {state?.error && <p className="err">{state.error}</p>}
    </div>
  );
}
