"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLANS, cartLines, type Cart, type Currency } from "@/lib/plans";
import { allFeatures, discountLabel, paymentSchedule, type Discount } from "@/lib/discount";
import { DiscountField } from "./DiscountField";
import { Arrow } from "./visuals";

const fmt = (v: number, cur: Currency, d?: number) => {
  const dec = d ?? (Number.isInteger(v) ? 0 : 2);
  return v.toLocaleString("ro-RO", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (cur === "EUR" ? " €" : " lei");
};

type Form = { cui: string; name: string; regCom: string; address: string; contact: string; email: string; phone: string; domain: string };

export function CheckoutModal({ open, onClose, cart, cur, discount, onDiscount }: { open: boolean; onClose: () => void; cart: Cart; cur: Currency; discount: Discount | null; onDiscount: (d: Discount | null) => void }) {
  const [f, setF] = useState<Form>({ cui: "", name: "", regCom: "", address: "", contact: "", email: "", phone: "", domain: "" });
  const [vatPayer, setVatPayer] = useState(true);
  const [shown, setShown] = useState(3);
  const [pm, setPm] = useState<"card" | "bank_transfer">("bank_transfer");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState<"anaf" | "pay" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const { lines } = cartLines(cart, cur);
  const schedule = paymentSchedule(cart, cur, discount);
  const today = schedule[0].total;
  const yearTotal = schedule.reduce((a, r) => a + r.total, 0);
  const dfmt = (d: Date) => d.toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function lookup() {
    setErr(null);
    setBusy("anaf");
    try {
      const r = await fetch("/api/anaf", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cui: f.cui }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "CUI negăsit");
      setF((x) => ({ ...x, name: j.name ?? x.name, regCom: j.regCom ?? x.regCom, address: j.address ?? x.address, phone: x.phone || j.phone || "" }));
      setVatPayer(Boolean(j.vatPayer));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nu am putut interoga ANAF");
    } finally {
      setBusy(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!accept) return setErr("Bifează acceptarea contractului-cadru.");
    setBusy("pay");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...f, vatPayer, paymentMode: pm, currency: cur, cart, accept, discountCode: discount?.code ?? "" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Comanda nu a putut fi trimisă");
      if (j.url || j.redirect) {
        window.location.href = j.url || j.redirect;
        return;
      }
      setDone(j.message || "Comanda a fost înregistrată. Îți trimitem confirmarea pe email.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Eroare neașteptată");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={`modal${open ? " on" : ""}`} role="dialog" aria-modal="true" aria-label="Finalizează abonamentul" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet" style={{ position: "relative" }} onSubmit={submit}>
        <div className="f">
          {done ? (
            <>
              <span className="eyebrow">Gata</span>
              <h3 style={{ marginTop: 14 }}>Mulțumim!</h3>
              <div className="lead-ok" style={{ marginTop: 16 }}>{done}</div>
            </>
          ) : (
            <>
              <span className="eyebrow">Pasul 1 din 2</span>
              <h3 style={{ marginTop: 14 }}>Date de facturare</h3>
              <p style={{ color: "var(--inkmute)", fontSize: 14, marginBottom: 20 }}>Introdu CUI-ul. Completăm automat restul din ANAF.</p>
              <div className="fld">
                <label htmlFor="co-cui">CUI</label>
                <div className="cui">
                  <input id="co-cui" value={f.cui} onChange={set("cui")} placeholder="RO12345678" required inputMode="text" autoComplete="off" />
                  <button type="button" onClick={lookup} disabled={busy === "anaf" || f.cui.replace(/\D/g, "").length < 2}>{busy === "anaf" ? "Caut…" : "Caută"}</button>
                </div>
              </div>
              <div className="grid2">
                <div className="fld"><label htmlFor="co-name">Denumire firmă</label><input id="co-name" value={f.name} onChange={set("name")} required autoComplete="organization" /></div>
                <div className="fld"><label htmlFor="co-reg">Nr. Reg. Com.</label><input id="co-reg" value={f.regCom} onChange={set("regCom")} /></div>
              </div>
              <div className="fld"><label htmlFor="co-addr">Adresă sediu</label><input id="co-addr" value={f.address} onChange={set("address")} required autoComplete="street-address" /></div>
              <div className="grid2">
                <div className="fld"><label htmlFor="co-contact">Persoană de contact</label><input id="co-contact" value={f.contact} onChange={set("contact")} placeholder="Nume Prenume" required autoComplete="name" /></div>
                <div className="fld"><label htmlFor="co-email">Email (cont și facturi)</label><input id="co-email" type="email" value={f.email} onChange={set("email")} placeholder="contabilitate@firma.ro" required autoComplete="email" /></div>
              </div>
              <div className="grid2">
                <div className="fld"><label htmlFor="co-phone">Telefon</label><input id="co-phone" type="tel" value={f.phone} onChange={set("phone")} placeholder="+40 7xx xxx xxx" autoComplete="tel" /></div>
                <div className="fld"><label htmlFor="co-dom">Domeniu dorit</label><input id="co-dom" value={f.domain} onChange={set("domain")} placeholder="firmata.ro" /></div>
              </div>
              <span className="eyebrow" style={{ marginTop: 20 }}>Pasul 2 din 2</span>
              <h3 style={{ marginTop: 14, fontSize: 22 }}>Metodă de plată</h3>
              <div className="pm">
                <button type="button" className={pm === "bank_transfer" ? "on" : ""} onClick={() => setPm("bank_transfer")}><b>Transfer bancar</b><span>Plătești din aplicația băncii, în lei</span></button>
                <button type="button" className="off" disabled aria-disabled="true"><b>Card</b><span>Disponibil în curând</span></button>
              </div>
              {pm === "card" ? (
                <div style={{ fontSize: 14, color: "var(--inkmute)" }}>Introduci cardul în pagina securizată Stripe. Acceptăm Visa, Mastercard, Apple Pay și Google Pay.</div>
              ) : (
                <div style={{ fontSize: 14, color: "var(--inkmute)" }}>După ce trimiți comanda, primești datele de plată pe ecran și pe email. Lansarea începe după ce confirmăm plata, de obicei în aceeași zi lucrătoare.</div>
              )}
              <label className="check">
                <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                <span>Accept <Link href="/legal/termeni" target="_blank" style={{ textDecoration: "underline" }}>contractul-cadru și condițiile abonamentului</Link>. Confirm că achiziționez în numele unei persoane juridice.</span>
              </label>
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn btn-ink" style={{ width: "100%", justifyContent: "space-between", marginTop: 6 }} disabled={busy === "pay"}>
                <span className="ic"><Arrow /></span>
                <span>{busy === "pay" ? "Se procesează…" : pm === "card" ? `Plătește ${fmt(today, cur)}` : `Trimite comanda · ${fmt(today, cur)}`}</span>
                <span style={{ width: 8 }} />
              </button>
            </>
          )}
        </div>
        <div className="s co-side">
          <h4 className="co-h">Comanda ta</h4>
          <div style={{ marginTop: 14 }}>
            {lines.map((l) => (
              <div key={l.code} className="co-line"><span>{l.label}</span><span>{fmt(l.total, cur)}</span></div>
            ))}
            {discount && schedule[0].discount > 0 && (
              <div className="co-line disc-line"><span>Cod {discount.code}<small>{discountLabel(discount, cur)}</small></span><span>−{fmt(schedule[0].discount, cur)}</span></div>
            )}
          </div>
          <div style={{ marginTop: 12 }}><DiscountField plan={cart.plan} value={discount} onChange={onDiscount} /></div>
          <div className="co-today">
            <span>Azi plătești</span>
            <b>{fmt(today, cur)}</b>
          </div>
          <p className="co-note">TVA inclus. Factura fiscală ajunge automat în SPV și pe email.</p>

          <h4 className="co-h" style={{ marginTop: 28 }}>Ce primești</h4>
          <ul className="co-feat">
            {allFeatures(cart.plan).map((x) => <li key={x}>{x}</li>)}
            <li>Lansare în 10 zile lucrătoare, garantată</li>
            <li>Domeniul pe firma ta din prima zi</li>
            <li>Website-ul devine al tău după 12 plăți</li>
          </ul>

          <h4 className="co-h" style={{ marginTop: 28 }}>Desfășurător de plată</h4>
          <p className="co-note" style={{ marginTop: 6 }}>12 rate · total {fmt(yearTotal, cur)} · perioadă minimă {PLANS[cart.plan].minMonths === 1 ? "o lună" : `${PLANS[cart.plan].minMonths} luni`}</p>
          <div className="co-sched">
            {schedule.slice(0, shown).map((r) => (
              <details key={r.n} className={r.n === 1 ? "first" : r.n === 12 ? "last" : ""}>
                <summary>
                  <span className="n">{String(r.n).padStart(2, "0")}</span>
                  <span className="d">{r.n === 1 ? "Azi" : dfmt(r.date)}</span>
                  <span className="a">{r.discount > 0 && <s>{fmt(r.base, cur)}</s>}{fmt(r.total, cur)}</span>
                </summary>
                <ul>
                  {r.includes.map((x) => <li key={x}>{x}</li>)}
                  {r.discount > 0 && discount && <li className="acc">Reducere {discount.code}: −{fmt(r.discount, cur)}</li>}
                </ul>
              </details>
            ))}
            {shown < schedule.length ? (
              <button type="button" className="co-more" onClick={() => setShown((n) => Math.min(schedule.length, n + 3))}>Arată mai mult · încă {Math.min(3, schedule.length - shown)} luni</button>
            ) : (
              <button type="button" className="co-more" onClick={() => setShown(3)}>Arată mai puțin</button>
            )}
          </div>
        </div>
        <button type="button" className="x" onClick={onClose} aria-label="Închide">✕</button>
      </form>
    </div>
  );
}
