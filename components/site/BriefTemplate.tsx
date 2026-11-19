"use client";

import { useState } from "react";

export const BRIEF = `BRIEF WEBSITE · [Numele firmei]
Data: [zz.ll.aaaa] · Persoană de contact: [nume, telefon, email]

1. AFACEREA
- Ce faci, într-o frază:
- Din ce an funcționezi și unde:
- Ce te diferențiază de concurență (3 motive):
  1.
  2.
  3.

2. CLIENȚII
- Cine este clientul ideal (vârstă, ocupație, oraș, firmă):
- Ce problemă îi rezolvi:
- Ce întrebări îți pun cel mai des înainte să cumpere:
- Ce îi oprește să cumpere (preț, încredere, timp):

3. OBIECTIVUL SITE-ULUI
- Acțiunea principală dorită (sună, programare, cerere de ofertă, comandă):
- Câte cereri pe lună vrei din site:
- Ai reclame plătite sau vei avea? (Google, Meta):

4. SERVICII ȘI PREȚURI
- Lista serviciilor, în ordinea importanței:
- Prețuri afișate pe site? (da / nu / "de la"):

5. CONCURENȚĂ ȘI INSPIRAȚIE
- 3 concurenți (link) și ce îți place sau nu la ei:
- 3 site-uri care îți plac, din orice domeniu (link + de ce):

6. IDENTITATE VIZUALĂ
- Ai logo? (fișier vectorial: SVG, AI, PDF):
- Culori și fonturi de brand:
- Stilul dorit (minimalist, cald, premium, jucăuș):
- Fotografii proprii? (echipă, locație, produse):

7. CONȚINUT
- Pagini dorite (Acasă, Servicii, Despre, Prețuri, Contact, Blog):
- Texte existente pe care le păstrăm:
- Recenzii și testimoniale (cu acordul clienților):
- Limbi:

8. FUNCȚIONALITĂȚI
- Formular de contact / programare online / WhatsApp:
- Integrări (CRM, email marketing, calendar, plăți):
- Hartă Google și program de lucru:

9. TEHNIC ȘI ACCESURI
- Domeniu: [numele] · registrar: [unde e înregistrat]
- Email pe domeniu (Google Workspace, Microsoft 365, altul):
- Site actual (link) și cine îl administrează:
- Conturi existente: Google Analytics, Search Console, Business Profile, Meta:

10. TERMENE
- Data dorită de lansare:
- Evenimente sau campanii legate de lansare:
`;

export default function BriefTemplate() {
  const [copied, setCopied] = useState(false);
  const download = () => {
    const blob = new Blob([BRIEF], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "brief-website-lunar.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div>
      <div className="tpl-actions">
        <button className="btn-plain" onClick={() => { navigator.clipboard?.writeText(BRIEF); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copiat ✓" : "Copiază modelul"}</button>
        <button className="btn-plain" onClick={download}>Descarcă .txt</button>
        <button className="btn-plain" onClick={() => window.print()}>Printează</button>
      </div>
      <pre className="tpl" tabIndex={0} aria-label="Model de brief">{BRIEF}</pre>
    </div>
  );
}
