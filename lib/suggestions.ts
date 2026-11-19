/** Sugestii lunare de îmbunătățire pentru clienți: 3 pe lună, alese după ce lipsește din site și rotite lunar. */
export type Suggestion = { id: string; title: string; why: string; body: string };

type Ctx = { pages: string[]; goal: string; hasLocal: boolean; psi: number | null; requested: string[]; month: string; seed: string };

const POOL: (Suggestion & { when?: (c: Ctx) => boolean })[] = [
  { id: "reviews", title: "Recenzii de la clienți pe pagina principală", why: "Vizitatorii au încredere în alți clienți mai mult decât în orice text de prezentare.", body: "Adăugați o secțiune cu 3–5 recenzii reale de la clienți (nume, poză opțională, câteva rânduri), aproape de butonul principal.", when: (c) => !c.pages.includes("Recenzii") },
  { id: "faq", title: "Secțiune de întrebări frecvente", why: "Răspunde la obiecții înainte să sune clientul și ajută la poziționarea în Google.", body: "Adăugați o secțiune cu 6–8 întrebări frecvente despre servicii, prețuri și program.", when: (c) => !c.pages.includes("Întrebări frecvente") },
  { id: "prices", title: "Prețuri orientative pentru serviciile principale", why: "Paginile cu prețuri primesc mai multe cereri calificate și mai puține întrebări inutile.", body: "Adăugați o pagină sau secțiune cu prețuri orientative („de la …”) pentru serviciile principale.", when: (c) => !c.pages.includes("Prețuri") },
  { id: "whatsapp", title: "Buton WhatsApp pe mobil", why: "Mulți clienți preferă un mesaj în loc de apel sau formular.", body: "Adăugați un buton de WhatsApp vizibil pe mobil, cu un mesaj precompletat." },
  { id: "booking", title: "Programare online direct din site", why: "Clienții pot rezerva și în afara programului, fără să sune.", body: "Integrați un calendar de programări (ex. Calendly, Cal.com sau sistemul vostru) pe pagina de contact și pe paginile de servicii.", when: (c) => c.goal === "Programări" && !c.pages.includes("Programare") },
  { id: "team", title: "Pagină cu echipa", why: "Fețele reale cresc încrederea, mai ales la servicii medicale și profesionale.", body: "Adăugați o pagină sau secțiune cu echipa: poză, nume, rol și o propoziție despre fiecare.", when: (c) => !c.pages.includes("Echipa") },
  { id: "speed", title: "Optimizare viteză pe mobil", why: "Fiecare secundă în plus la încărcare scade numărul de cereri.", body: "Optimizați imaginile și elementele care încarcă greu, ca scorul PageSpeed pe mobil să depășească 90.", when: (c) => c.psi != null && c.psi < 90 },
  { id: "gbp", title: "Profil Google Business conectat cu site-ul", why: "Apari în Google Maps și în căutările din zona ta.", body: "Verificați și completați profilul Google Business, legați-l de site și adăugați butonul „Vezi pe hartă”.", when: (c) => !c.hasLocal },
  { id: "service-pages", title: "Pagină separată pentru serviciul cel mai căutat", why: "O pagină dedicată poate apărea în Google pentru căutarea exactă a serviciului.", body: "Creați o pagină separată pentru serviciul principal, cu descriere, beneficii, întrebări frecvente și buton de contact." },
  { id: "portfolio", title: "Galerie cu lucrări sau rezultate", why: "Vizitatorii vor să vadă exemple înainte să te contacteze.", body: "Adăugați o galerie cu lucrări recente sau exemple de rezultate, cu o scurtă descriere la fiecare.", when: (c) => !c.pages.includes("Portofoliu") },
  { id: "cta", title: "Buton de contact fix pe mobil", why: "Butonul principal rămâne la îndemână oricât derulează vizitatorul.", body: "Adăugați o bară fixă jos pe mobil cu butonul principal (sunați, programare sau cerere de ofertă)." },
  { id: "offer", title: "Ofertă sau campanie pentru luna aceasta", why: "O ofertă cu termen dă vizitatorilor un motiv să te contacteze acum.", body: "Adăugați un banner sau o secțiune cu oferta lunii (ex. consultație gratuită, reducere la un serviciu), cu dată de expirare." },
  { id: "blog", title: "Un articol care răspunde la o întrebare frecventă", why: "Articolele aduc trafic din Google pe termen lung.", body: "Scrieți un articol de 600–900 de cuvinte care răspunde la cea mai frecventă întrebare a clienților voștri.", when: (c) => !c.pages.includes("Blog") },
  { id: "about", title: "Povestea firmei pe pagina Despre noi", why: "Oamenii cumpără de la oameni: povestea creează legătură și încredere.", body: "Rescrieți pagina Despre noi cu povestea firmei, valorile și ce vă diferențiază, plus o poză reală.", when: (c) => !c.pages.includes("Despre noi") },
  { id: "trust", title: "Logo-uri de parteneri, certificări sau premii", why: "Semnalele de încredere reduc ezitarea înainte de contact.", body: "Adăugați o bandă cu logo-urile partenerilor, certificările sau premiile relevante." },
  { id: "form", title: "Formular de contact mai scurt", why: "Fiecare câmp în minus crește numărul de mesaje trimise.", body: "Reduceți formularul de contact la nume, telefon sau email și mesaj, cu confirmare clară după trimitere." },
];

function hash(s: string) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export function monthlySuggestions(c: Ctx, n = 3): Suggestion[] {
  const eligible = POOL.filter((s) => (!s.when || s.when(c)) && !c.requested.some((t) => t.toLowerCase().includes(s.title.toLowerCase().slice(0, 18))));
  const start = hash(c.seed + c.month) % Math.max(1, eligible.length);
  return Array.from({ length: Math.min(n, eligible.length) }, (_, i) => eligible[(start + i * 5) % eligible.length])
    .filter((s, i, a) => a.findIndex((x) => x.id === s.id) === i)
    .map(({ id, title, why, body }) => ({ id, title, why, body }));
}
