/** Întrebările brief-ului, grupate. `kind` decide controlul din formular. */
export type BriefQ = { key: string; label: string; hint?: string; kind: "text" | "area" | "select" | "multi"; options?: string[]; required?: boolean };

export const BRIEF_SECTIONS: { title: string; lead: string; qs: BriefQ[] }[] = [
  {
    title: "Despre firma ta",
    lead: "Ne ajută să scriem textele pentru clienții tăi, nu pentru noi.",
    qs: [
      { key: "company_desc", label: "Ce face firma ta?", hint: "2 până la 3 propoziții, ca pentru un client nou.", kind: "area", required: true },
      { key: "services", label: "Ce servicii sau produse vrei să promovăm pe site?", hint: "Pune-le în ordinea importanței.", kind: "area", required: true },
      { key: "audience", label: "Cine sunt clienții tăi ideali?", hint: "Vârstă, tip de firmă, oraș, ce problemă au.", kind: "area", required: true },
      { key: "usp", label: "De ce te aleg clienții pe tine și nu pe concurență?", kind: "area" },
      { key: "competitors", label: "Concurenți sau firme pe care le urmărești", hint: "Nume sau site-uri.", kind: "text" },
      { key: "area", label: "Unde lucrezi?", hint: "Oraș, zonă, toată țara sau online.", kind: "text" },
      { key: "contact", label: "Date de contact afișate pe site", hint: "Telefon, email, adresă, program.", kind: "area", required: true },
      { key: "socials", label: "Rețele sociale", hint: "Linkuri către Facebook, Instagram, LinkedIn, TikTok.", kind: "text" },
    ],
  },
  {
    title: "Cum vrei să arate site-ul",
    lead: "Fără răspunsuri greșite. Dacă nu știi, lasă gol și te ajutăm noi.",
    qs: [
      { key: "goal", label: "Care e scopul principal al site-ului?", kind: "select", required: true, options: ["Cereri de ofertă", "Programări", "Apeluri telefonice", "Vânzări online", "Prezentare și încredere"] },
      { key: "action", label: "Ce vrei să facă vizitatorul după ce intră pe site?", kind: "text" },
      { key: "pages", label: "Ce pagini vrei?", kind: "multi", options: ["Acasă", "Despre noi", "Servicii", "Prețuri", "Portofoliu", "Echipa", "Recenzii", "Întrebări frecvente", "Blog", "Programare", "Contact"] },
      { key: "style", label: "Ce stil vizual îți place?", hint: "Ex: minimalist, elegant, cald, tehnic, colorat.", kind: "text" },
      { key: "colors", label: "Culori de brand sau culori preferate", kind: "text" },
      { key: "logo", label: "Logo", kind: "select", options: ["Am logo", "Nu am logo", "Vreau un logo nou"] },
      { key: "texts", label: "Textele site-ului", kind: "select", options: ["Le scrieți voi", "Am textele pregătite", "Parțial, completați voi"] },
      { key: "domain_existing", label: "Ai deja domeniu sau site? Care?", kind: "text" },
      { key: "features", label: "Funcționalități speciale", hint: "Ex: WhatsApp, rezervări, plăți online, mai multe limbi, newsletter.", kind: "text" },
    ],
  },
];

export const BRIEF_KEYS = BRIEF_SECTIONS.flatMap((s) => s.qs);
export const BRIEF_MAX_FILES = 20;
export const BRIEF_MAX_MB = 10;
