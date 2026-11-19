import { getPortalData } from "@/lib/portal-data";
import { date } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import { ConfirmAction, CopyButton } from "@/components/app/forms";
import { requestBankTransfer } from "@/app/cont/actions";
import { has } from "@/lib/env";
import { cap } from "@/lib/labels";
import { Plus } from "@/components/site/visuals";

export default async function MethodsPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  const d = await getPortalData();
  if (!d.ready) return null;
  const stripeReady = has.stripe() && Boolean(d.company.stripe_customer_id);
  const bankMode = d.sub?.payment_mode === "bank_transfer";
  return (
    <div>
      <div className="topbar"><div><h1>Metode de plată</h1><p>{bankMode ? "Plătești fiecare rată prin transfer bancar, pe baza proformei." : "Abonamentul se debitează automat de pe metoda implicită."}</p></div></div>
      {e && <p className="err" style={{ marginBottom: 12 }}>Gestionarea cardurilor devine disponibilă după prima plată cu cardul.</p>}
      <div className="g g-3">
        {d.pms.map((pm, i) => (
          <div className="paycard" key={pm.id} style={i % 2 ? { background: "linear-gradient(140deg,#1D2430,#0F1218)" } : undefined}>
            <div className="top"><span className="chip" />{pm.is_default ? <Pill tone="ok">Implicită</Pill> : <span style={{ fontSize: 12 }}>Secundară</span>}</div>
            <div className="num">•••• •••• •••• {pm.last4}</div>
            <div className="bot"><span>{d.company!.name.toUpperCase()}</span><span>{pm.brand.toUpperCase()} · {String(pm.exp_month).padStart(2, "0")}/{String(pm.exp_year).slice(-2)}</span></div>
          </div>
        ))}
        <form action="/api/billing-portal" method="post" style={{ display: "contents" }}>
          <button className="paycard add" disabled={!stripeReady || !d.ctx.canEdit} title={stripeReady ? "" : "Disponibil după prima plată cu cardul"}>
            <Plus size={28} /><span>{d.pms.length ? "Adaugă sau schimbă cardul" : "Adaugă card"}</span><small style={{ fontSize: 12 }}>Apple Pay · Google Pay · Card · pagină securizată Stripe</small>
          </button>
        </form>
      </div>
      <div className="g g-2" style={{ marginTop: 12 }}>
        <div className="panel">
          <h3>Plată prin transfer bancar</h3>
          <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>Primești proforma cu 7 zile înainte de scadență. Plata se confirmă în 1–2 zile lucrătoare.</p>
          {d.bank.beneficiary && <><span className="mono muted">BENEFICIAR</span><div className="iban">{d.bank.beneficiary}{d.bank.bank ? ` · ${d.bank.bank}` : ""}</div></>}
          <span className="mono muted">IBAN EUR</span><div className="iban">{d.bank.iban_eur || "Se comunică pe proformă"}{d.bank.iban_eur && <CopyButton text={d.bank.iban_eur} />}</div>
          <span className="mono muted">IBAN RON</span><div className="iban">{d.bank.iban_ron || "Se comunică pe proformă"}{d.bank.iban_ron && <CopyButton text={d.bank.iban_ron} />}</div>
          <span className="mono muted">REFERINȚĂ OBLIGATORIE</span><div className="iban">{d.company.bank_reference}<CopyButton text={d.company.bank_reference} /></div>
          {!bankMode && d.ctx.canEdit && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
              <ConfirmAction action={requestBankTransfer} label="Plătesc prin transfer" confirm="Trimitem cererea de trecere pe transfer bancar?" />
            </div>
          )}
        </div>
        <div className="panel">
          <h3>Istoric încercări de plată</h3>
          {d.attempts.length ? d.attempts.map((a) => (
            <div className="kv" key={a.id}>
              <span>{date(a.attempted_at, { day: "numeric", month: "short" })} · {cap(a.method_label)}</span>
              <Pill tone={a.succeeded ? "ok" : "bad"}>{a.succeeded ? "Reușită" : "Refuzată"}</Pill>
            </div>
          )) : <div className="empty">Nicio plată încă.</div>}
        </div>
      </div>
    </div>
  );
}
