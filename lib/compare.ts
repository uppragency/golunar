/** Comparația LUNAR / agenție clasică / site făcut cu AI. */
export type Cell = { t: string; win?: boolean };
export const COMP: { k: string; lunar: Cell; agency: Cell; ai: Cell }[] = [
  { k: "Cost la început", lunar: { t: "6 lei prima lună", win: true }, agency: { t: "Mii de lei în avans" }, ai: { t: "Abonament + ore din timpul tău" } },
  { k: "Timp până la lansare", lunar: { t: "10 zile lucrătoare, garantat", win: true }, agency: { t: "Săptămâni sau luni" }, ai: { t: "Depinde cât timp ai tu" } },
  { k: "Design", lunar: { t: "Personalizat pentru brandul tău", win: true }, agency: { t: "Personalizat" }, ai: { t: "Șablon, seamănă cu alte site-uri" } },
  { k: "Texte pentru clienți", lunar: { t: "Scrise de noi, orientate spre cereri", win: true }, agency: { t: "Uneori, cost separat" }, ai: { t: "Generice, le corectezi singur" } },
  { k: "Modificări după lansare", lunar: { t: "Incluse lunar", win: true }, agency: { t: "Plătite separat" }, ai: { t: "Le faci singur" } },
  { k: "Hosting, SSL, backup", lunar: { t: "Incluse și monitorizate", win: true }, agency: { t: "De obicei separat" }, ai: { t: "Inclus, fără monitorizare" } },
  { k: "SEO și viteză", lunar: { t: "Configurate din prima zi", win: true }, agency: { t: "Variază" }, ai: { t: "De bază" } },
  { k: "Proprietate", lunar: { t: "Al tău după 12 plăți", win: true }, agency: { t: "Al tău după plata integrală" }, ai: { t: "Rămâi pe platformă" } },
  { k: "Suport", lunar: { t: "Răspuns în 48 de ore, din portal", win: true }, agency: { t: "Când au timp" }, ai: { t: "Ticket la platformă" } },
];

