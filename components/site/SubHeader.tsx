"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LeadModal } from "./LeadModal";
import PromoBar from "./PromoBar";

const LINKS: [string, string][] = [["/#proces", "Proces"], ["/#portofoliu", "Portofoliu"], ["/#abonamente", "Abonamente"], ["/resurse", "Resurse"], ["/#intrebari", "Întrebări"]];

export default function SubHeader() {
  const [lead, setLead] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <>
      <PromoBar />
      <nav className="nav" aria-label="Principal">
        <Link href="/" className="logo"><i />LUNAR</Link>
        <ul>{LINKS.slice(0, 4).map(([h, l]) => <li key={h}><Link href={h}>{l}</Link></li>)}</ul>
        <div className="nav-r">
          <Link href="/cont" className="login">Contul meu</Link>
          <button className={`burger${menu ? " on" : ""}`} aria-label={menu ? "Închide meniul" : "Deschide meniul"} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <span /><span /><span />
          </button>
          <button className="cta" onClick={() => { setMenu(false); setLead(true); }}>Discuție<span className="lg">&nbsp;gratuită</span></button>
        </div>
      </nav>
      <div className={`mnav${menu ? " on" : ""}`} aria-hidden={!menu} onClick={(e) => e.target === e.currentTarget && setMenu(false)}>
        <div className="mnav-in">
          <ul>
            {LINKS.map(([h, l], i) => (
              <li key={h} style={{ transitionDelay: menu ? `${80 + i * 45}ms` : "0ms" }}>
                <Link href={h} tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}><span className="mono">0{i + 1}</span>{l}</Link>
              </li>
            ))}
          </ul>
          <div className="mnav-foot" style={{ transitionDelay: menu ? "320ms" : "0ms" }}>
            <span />
            <Link href="/cont" className="btn-plain" tabIndex={menu ? 0 : -1}>Contul meu</Link>
          </div>
        </div>
      </div>
      <LeadModal open={lead} onClose={() => setLead(false)} plan="growth" />
    </>
  );
}
