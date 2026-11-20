"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/track";
import { Arrow } from "./visuals";
import { CONTACT_TOPICS, type Topic } from "@/lib/contact";


const PRESET: Record<string, { topic: Topic; message: string }> = {
  migrare: { topic: "nou", message: "Am deja un site și vreau migrarea gratuită la LUNAR. Adresa site-ului actual: " },
  anual: { topic: "nou", message: "Mă interesează plata anuală. " },
};

/** Formularul de contact în 2 pași: subiectul, apoi datele și mesajul. */
export default function ContactForm() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);
  const t = CONTACT_TOPICS.find((x) => x.id === topic);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("subiect") || "";
    const p = PRESET[s];
    if (p) { setTopic(p.topic); setMessage(p.message); }
    else if (CONTACT_TOPICS.some((x) => x.id === s)) setTopic(s as Topic);
  }, []);

  useEffect(() => {
    if (!topic) return;
    // Pe desktop mutăm cursorul în primul câmp; pe telefon doar aducem cardul în vizor (fără să deschidem tastatura).
    if (window.matchMedia("(pointer:fine)").matches) firstField.current?.focus({ preventScroll: true });
    const card = firstField.current?.closest(".ct");
    if (card && card.getBoundingClientRect().top < 80) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [topic]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topic) return;
    setErr(null);
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, category: topic }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Mesajul nu a putut fi trimis.");
      setOk(true);
      track("generate_lead", { lead_source: "contact", category: topic });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Eroare neașteptată.");
    } finally {
      setBusy(false);
    }
  }

  if (ok)
    return (
      <div className="ct card form-dark" role="status">
        <span className="eyebrow">Mesaj trimis</span>
        <h2 className="ct-h">Mulțumim! Am primit mesajul.</h2>
        <p className="ct-sub">Îți răspundem pe email în cel mult o zi lucrătoare. Ți-am trimis și o confirmare.</p>
        <Link href="/" className="btn btn-accent" style={{ marginTop: 8 }}><span className="ic"><Arrow /></span>Înapoi la pagina principală</Link>
      </div>
    );

  return (
    <div className="ct card form-dark">
      <div className="ct-top">
        <span className="ct-step">Pasul {topic ? 2 : 1} din 2</span>
        <span className="ct-bar" aria-hidden="true"><i style={{ width: topic ? "100%" : "50%" }} /></span>
      </div>

      {!topic ? (
        <>
          <h2 className="ct-h">Cu ce te putem ajuta?</h2>
          <div className="ct-opts">
            {CONTACT_TOPICS.map((x) => (
              <button type="button" key={x.id} className="ct-opt" onClick={() => setTopic(x.id)}>
                <span>{x.label}</span><Arrow />
              </button>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <h2 className="ct-h">Completează formularul</h2>
          <div className="ct-chosen">
            <div><b>{t?.label}</b><span>{t?.hint}</span></div>
            <button type="button" onClick={() => { setTopic(null); setErr(null); }}>Schimbă</button>
          </div>
          {topic === "client" && (
            <p className="ct-tip">Ai cont? <Link href="/cont/cereri">Trimite cererea din portal</Link> și intră direct în lucru, cu capturi și pagina vizată.</p>
          )}
          <div className="grid2">
            <div className="fld"><label htmlFor="ct-name">Nume</label><input ref={firstField} id="ct-name" name="name" required minLength={2} autoComplete="name" /></div>
            <div className="fld"><label htmlFor="ct-email">Email</label><input id="ct-email" name="email" type="email" required autoComplete="email" /></div>
          </div>
          <div className="grid2">
            <div className="fld"><label htmlFor="ct-phone">Telefon</label><input id="ct-phone" name="phone" type="tel" autoComplete="tel" placeholder="Opțional" /></div>
            <div className="fld"><label htmlFor="ct-co">Firmă</label><input id="ct-co" name="company" autoComplete="organization" placeholder="Opțional" /></div>
          </div>
          <div className="fld"><label htmlFor="ct-msg">Mesaj</label><textarea id="ct-msg" name="message" rows={6} required minLength={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
          {(topic === "nou" || topic === "altceva") && (
            <label className="check mk-opt"><input type="checkbox" name="marketing" value="1" /><span>Vreau și 5 emailuri scurte cu sfaturi și oferte LUNAR, în 14 zile. Mă pot dezabona oricând.</span></label>
          )}
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn btn-accent ct-send" disabled={busy}><span className="ic"><Arrow /></span>{busy ? "Se trimite…" : "Trimite mesajul"}</button>
        </form>
      )}
      <p className="ct-legal">Prin trimitere ești de acord cu <Link href="/legal/confidentialitate">Politica de confidențialitate</Link>.</p>
    </div>
  );
}
