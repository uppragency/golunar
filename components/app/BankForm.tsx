"use client";

import { useActionState } from "react";
import { Feedback } from "./forms";

type State = { ok?: string; error?: string } | null;
type Bank = { beneficiary?: string; bank?: string; iban_ron?: string; iban_eur?: string };

export default function BankForm({ action, bank }: { action: (s: State, f: FormData) => Promise<State>; bank: Bank }) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form action={run} className="form-dark">
      <div className="grid2">
        <div className="fld"><label htmlFor="b-ben">Beneficiar</label><input id="b-ben" name="beneficiary" defaultValue={bank.beneficiary ?? ""} placeholder="LUNAR SRL" /></div>
        <div className="fld"><label htmlFor="b-bank">Bancă</label><input id="b-bank" name="bank" defaultValue={bank.bank ?? ""} /></div>
      </div>
      <div className="grid2">
        <div className="fld"><label htmlFor="b-ron">IBAN RON</label><input id="b-ron" name="iban_ron" defaultValue={bank.iban_ron ?? ""} className="mono" /></div>
        <div className="fld"><label htmlFor="b-eur">IBAN EUR</label><input id="b-eur" name="iban_eur" defaultValue={bank.iban_eur ?? ""} className="mono" /></div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}><button className="btn-plain" disabled={pending}>Salvează</button><Feedback state={state} /></div>
    </form>
  );
}
