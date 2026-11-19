"use client";

import { useState, useTransition } from "react";
import { logContact } from "@/app/admin/actions";

const TEMPLATES = [
  { k: "call", s: "Revin cu un telefon", b: "Bună ziua,\n\nAș vrea să discutăm câteva minute despre website. Când vă este comod să vă sun?\n\nMulțumesc,\nEchipa LUNAR" },
  { k: "materials", s: "Ne lipsesc câteva materiale", b: "Bună ziua,\n\nCa să continuăm lucrul la website, avem nevoie de:\n- \n- \n\nLe puteți încărca în portal sau trimite ca răspuns la acest email.\n\nMulțumesc,\nEchipa LUNAR" },
  { k: "payment", s: "Plata ratei LUNAR", b: "Bună ziua,\n\nVă scriu în legătură cu rata lunară. Datele de plată sunt în portal, la Plăți. Dacă ați plătit deja, vă rog să ignorați mesajul.\n\nMulțumesc,\nEchipa LUNAR" },
  { k: "thanks", s: "Mulțumim!", b: "Bună ziua,\n\nVă mulțumim că lucrați cu noi. Dacă aveți idei de îmbunătățire pentru website, le puteți trimite oricând din portal.\n\nEchipa LUNAR" },
];

/** Contact direct din fișa clientului; fiecare acțiune apare în cronologie. */
export default function ContactButtons({ companyId, phone, email }: { companyId: string; phone: string | null; email: string | null }) {
  const [, start] = useTransition();
  const [tpl, setTpl] = useState(TEMPLATES[0].k);
  const intl = phone ? phone.replace(/[^\d+]/g, "").replace(/^0/, "+40").replace(/^\+/, "") : "";
  const go = (channel: "whatsapp" | "phone" | "email", href: string, subject?: string) => {
    start(async () => { await logContact(companyId, channel, subject); });
    window.open(href, channel === "phone" ? "_self" : "_blank");
  };
  const t = TEMPLATES.find((x) => x.k === tpl)!;
  return (
    <div className="contact">
      {phone && <button className="btn-plain sm" onClick={() => go("whatsapp", `https://wa.me/${intl}`)}>WhatsApp</button>}
      {phone && <button className="btn-plain sm" onClick={() => go("phone", `tel:${phone.replace(/\s/g, "")}`)}>Sună</button>}
      {email && (
        <span className="contact-mail">
          <select value={tpl} onChange={(e) => setTpl(e.target.value)} aria-label="Șablon email">{TEMPLATES.map((x) => <option key={x.k} value={x.k}>{x.s}</option>)}</select>
          <button className="btn-plain sm" onClick={() => go("email", `mailto:${email}?subject=${encodeURIComponent(t.s)}&body=${encodeURIComponent(t.b)}`, t.s)}>Email</button>
        </span>
      )}
      {!phone && !email && <span className="muted">Fără date de contact.</span>}
    </div>
  );
}
