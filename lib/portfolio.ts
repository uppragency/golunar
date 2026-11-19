/**
 * Portofoliu: capturi în /public/portfolio/<slug>.webp (pagina întreagă) și <slug>-thumb.webp (primul ecran).
 * `url` = linkul live; fără el, cardul nu afișează link.
 */
export type Project = { slug: string; name: string; category: string; url?: string; h: number };

export const PORTFOLIO: Project[] = [
  { slug: "as-dental", name: "AS Dental", category: "Clinică stomatologică", url: "https://asdental.ro", h: 7246 },
  { slug: "hasha-tattoo", name: "Hasha Tattoo", category: "Salon tatuaje și piercing", url: "https://www.hasha-tattoo.ro", h: 9000 },
  { slug: "dinamo", name: "Dinamo București", category: "Club de fotbal", h: 3084 },
  { slug: "mentormed-platforma", name: "MentorMed", category: "Platformă de cursuri pentru medici", url: "https://platforma.drbogdanchiper.ro", h: 5876 },
  { slug: "sports-diplomacy", name: "Sports Diplomacy Conference", category: "Conferință · Palatul Parlamentului", url: "https://sportsdiplomacy.ro", h: 5424 },
  { slug: "identical-lab", name: "iDentical Lab", category: "Laborator dentar digital", url: "https://identicallab.vercel.app", h: 9000 },
  { slug: "dental-masters-academy", name: "Dental Masters Academy", category: "Academie de implantologie", url: "https://dentalmastersacademy.vercel.app", h: 8039 },
  { slug: "avenue-properties", name: "Avenue Properties", category: "Imobiliare", h: 1863 },
  { slug: "techtio", name: "Techtio", category: "Agenție digitală", h: 1708 },
  { slug: "esa", name: "ESA", category: "Tehnologie pentru antrenament sportiv", h: 1703 },
  { slug: "barca-academy", name: "Barça Academy Bucharest", category: "Academie de fotbal", h: 1703 },
  { slug: "influencer-marketing", name: "Marketing prin influenceri", category: "Platformă UGC și influenceri", h: 2161 },
  { slug: "amaliss", name: "Amaliss Gioielli", category: "Magazin online de bijuterii", h: 6130 },
  { slug: "inova-plast", name: "Inova Plast", category: "Producător de ambalaje", h: 9000 },
  { slug: "jona-clinic", name: "Jona Clinic", category: "Clinică stomatologică digitală", h: 7685 },
  { slug: "mihai-dinica", name: "Mihai Dinica", category: "Consultanță investiții imobiliare", h: 9000 },
  { slug: "chindia-shop", name: "Chindia Târgoviște", category: "Magazin oficial de club", h: 4131 },
  { slug: "artdent", name: "ArtDent Slobozia", category: "Clinică stomatologică", url: "https://www.artdentslobozia.ro", h: 8408 },
  { slug: "superbootcamp", name: "SuperBootCamp MentorMed 2027", category: "Eveniment medical", url: "https://drbogdanchiper.ro", h: 9000 },
];

export const PORTFOLIO_NOTE = "Previzualizările sunt capturi de ecran comprimate și pot conține bug-uri de previzualizare. Calitatea reală se vede pe site-urile live.";
