import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import BankDetails from "@/components/site/BankDetails";
import { Arrow } from "@/components/site/visuals";
import TrackPurchase from "@/components/site/TrackPurchase";

export const metadata: Metadata = { title: "Comanda a fost înregistrată", robots: { index: false, follow: false } };

export default async function ThankYou({ searchParams }: { searchParams: Promise<{ ref?: string; suma?: string; lunar?: string; plan?: string; email?: string; cont?: string; anual?: string; v?: string; m?: string; cur?: string; pc?: string }> }) {
  const q = await searchParams;
  const ref = /^LNR-\d{3,6}$/.test(q.ref ?? "") ? q.ref! : null;
  const amount = (q.suma ?? "").slice(0, 30) || null;
  const monthly = q.anual ? null : (q.lunar ?? "").slice(0, 30) || null;
  const plan = (q.plan ?? "").slice(0, 30) || null;
  const email = /^[^@\s]+@[^@\s]+$/.test(q.email ?? "") ? q.email! : "";
  const hasAccount = q.cont === "1";
  const e = encodeURIComponent(email);
  return (
    <PageShell
      crumbs={[["/comanda/multumim", "Comandă înregistrată"]]}
      eyebrow="Mulțumim"
      title={<>Comanda e înregistrată. <span className="dim">Mai sunt doi pași.</span></>}
      lede={`Plătește prima rată prin transfer bancar și intră în contul tău de client${email ? ` cu ${email}` : ""}. Ți-am trimis aceleași informații și pe email.`}
      cta={false}
    >
      {ref && <TrackPurchase id={ref} value={Number(q.v) || 0} monthly={Number(q.m) || 0} currency={q.cur === "EUR" ? "EUR" : "RON"} plan={["essential", "growth", "partner"].includes(q.pc ?? "") ? q.pc! : "essential"} />}
      <div className="wide-block">
        <div className="ty-grid">
          <div className="card ty-card">
            <span className="offer-k">{q.anual ? "Pasul 1 · Plătește anul întreg" : "Pasul 1 · Plătește prima rată"}</span>
            <h2>Datele pentru transfer</h2>
            {(ref || amount) && (
              <div className="order-sum">
                {ref && <div><span>Număr comandă</span><b className="mono">{ref}</b></div>}
                {plan && <div><span>Plan</span><b>{plan}</b></div>}
                {amount && <div className="big"><span>De plată acum</span><b>{amount}</b></div>}
                {monthly && <div><span>Apoi, lunar</span><b>{monthly}</b></div>}
              </div>
            )}
            <BankDetails amount={amount} reference={ref} />
          </div>
          <div className="card ty-card">
            <span className="offer-k">Pasul 2 · Intră în contul tău</span>
            <h2>{hasAccount ? "Ai deja cont" : "Creează-ți parola"}</h2>
            <p className="muted">{hasAccount ? "Comanda a fost adăugată în contul tău existent." : `Contul e deja creat pe ${email || "emailul comenzii"}. Alege o parolă și confirmă adresa din emailul primit.`}</p>
            <div className="ty-actions">
              {hasAccount ? (
                <Link href={`/login?mode=password&email=${e}`} className="btn btn-accent"><span className="ic"><Arrow /></span>Intră în cont</Link>
              ) : (
                <Link href={`/login?mode=signup&email=${e}`} className="btn btn-accent"><span className="ic"><Arrow /></span>Creează parola contului</Link>
              )}
              <Link href={`/login?email=${e}`} className="btn btn-ghost"><span className="ic"><Arrow /></span>Primește link de acces pe email</Link>
            </div>
            <ol className="ty-steps">
              <li><b>Plătești</b> prima rată cu referința comenzii.</li>
              <li><b>Confirmăm plata</b>, de obicei în aceeași zi lucrătoare. Primești email.</li>
              <li><b>Completezi brief-ul</b> din cont: despre firmă, ce site vrei, exemple și poze.</li>
              <li><b>Lansăm în 10 zile lucrătoare</b> de la brief.</li>
            </ol>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
