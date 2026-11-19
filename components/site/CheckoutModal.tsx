"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cartLines, type Cart, type Currency } from "@/lib/plans";
import { Arrow } from "./visuals";

const fmt = (v: number, cur: Currency, d?: number) => {
  const dec = d ?? (Number.isInteger(v) ? 0 : 2);
  return v.toLocaleString("ro-RO", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (cur === "EUR" ? " €" : " lei");
};

type Form = { cui: string; name: string; regCom: string; address: string; contact: string; email: string; phone: string; domain: string };

export function CheckoutModal({ open, onClose, cart, cur }: { open: boolean; onClose: () => void; cart: Cart; cur: Currency }) {
  const [f, setF] = useState<Form>({ cui: "", name: "", regCom: "", address: "", contact: "", email: "", phone: "", domain: "" });
  const [vatPayer, setVatPayer] = useState(true);
  const [pm, setPm] = useState<"card" | "bank_transfer">("card");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState<"anaf" | "pay" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const { lines, gross } = cartLines(cart, cur);

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
        body: JSON.stringify({ ...f, vatPayer, paymentMode: pm, currency: cur, cart, accept }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Comanda nu a putut fi trimisă");
      if (j.url) {
        window.location.href = j.url;
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
                  <button type="button" onClick={lookup} disabled={busy === "anaf" || f.cui.replace(/\D/g, "").length < 2}>{busy === "anaf" ? "Caut…" : "Caută în ANAF"}</button>
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
                <button type="button" className={pm === "card" ? "on" : ""} onClick={() => setPm("card")}><b>Card</b><span>Debitare automată lunară prin Stripe</span></button>
                <button type="button" className={pm === "bank_transfer" ? "on" : ""} onClick={() => setPm("bank_transfer")}><b>Transfer bancar</b><span>Proformă lunară, plată în 5 zile</span></button>
              </div>
              {pm === "card" ? (
                <div style={{ fontSize: 14, color: "var(--inkmute)" }}>Introduci cardul în pagina securizată Stripe. Acceptăm Visa, Mastercard, Apple Pay și Google Pay.</div>
              ) : (
                <div style={{ fontSize: 14, color: "var(--inkmute)" }}>Primești proforma pe email. Lansarea începe după confirmarea primei plăți în cont.</div>
              )}
              <label className="check">
                <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                <span>Accept <Link href="/legal/termeni" target="_blank" style={{ textDecoration: "underline" }}>contractul-cadru și condițiile abonamentului</Link>. Confirm că achiziționez în numele unei persoane juridice.</span>
              </label>
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn btn-ink" style={{ width: "100%", justifyContent: "space-between", marginTop: 6 }} disabled={busy === "pay"}>
                <span className="ic"><Arrow /></span>
                <span>{busy === "pay" ? "Se procesează…" : pm === "card" ? `Plătește ${fmt(gross, cur)}` : "Trimite comanda"}</span>
                <span style={{ width: 8 }} />
              </button>
            </>
          )}
        </div>
        <div className="s">
          <h4 className="mono" style={{ color: "var(--mute)", fontWeight: 400, textTransform: "uppercase", letterSpacing: ".08em" }}>Comanda ta</h4>
          <div style={{ marginTop: 16 }}>
            {lines.map((l) => (
              <div key={l.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "#C4C4CA" }}>{l.label}</span><span>{fmt(l.total, cur)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 20 }}>
            <span className="muted">Azi plătești</span>
            <b style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-.04em" }}>{fmt(gross, cur)}</b>
          </div>
          <p style={{ fontSize: 12, color: "var(--mute)", marginTop: 12 }}>TVA inclus. Apoi aceeași sumă lunar, la aceeași dată. Factura fiscală ajunge automat în SPV și pe email.</p>
        </div>
        <button type="button" className="x" onClick={onClose} aria-label="Închide">✕</button>
      </form>
    </div>
  );
}
