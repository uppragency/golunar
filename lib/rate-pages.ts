import { PLANS } from "@/lib/plans";

/**
 * Pagini SEO pentru căutările „site în rate”, „website pe abonament” și înrudite.
 * Intenționat fără linkuri din header, footer sau homepage: sunt găsite prin Google, sitemap și llms.txt,
 * și se leagă doar între ele.
 */
export type RatePage = {
  slug: string;
  keyword: string;
  metaTitle: string;
  desc: string;
  eyebrow: string;
  h1: string;
  h1Dim: string;
  lede: string;
  sections: { h: string; p?: string[]; ul?: string[] }[];
  faq: [string, string][];
  updated: string;
};

const E = PLANS.essential.ron, G = PLANS.growth.ron, P = PLANS.partner.ron;
const fmt = (n: number) => n.toLocaleString("ro-RO");
const UPDATED = "2026-11-21";

/** Elemente comune, ca toate paginile să spună exact același lucru despre ofertă. */
const INCLUDES = [
  "Design personalizat, gândit întâi pentru telefon, fără șabloane cumpărate.",
  "Texte scrise pentru clienții tăi și structură orientată spre cereri de ofertă.",
  "Domeniu .ro, hosting în Uniunea Europeană, certificat SSL și backup zilnic.",
  "Mentenanță, actualizări de securitate și monitorizare la fiecare 10 minute.",
  "Îmbunătățiri lunare incluse și raport pe email în fiecare lună.",
  "Factură fiscală pe firmă pentru fiecare plată. Prețul afișat este final, TVA inclus.",
];

const PLANS_UL = [
  `Esențial: ${E} lei pe lună, perioadă minimă 3 luni. Prezența online completă pentru o firmă mică.`,
  `Creștere: ${G} lei pe lună, perioadă minimă 2 luni. Adaugă SEO lunar, vizibilitate în AI și măsurarea conversiilor.`,
  `Partener: ${P} lei pe lună, perioadă minimă o lună. Adaugă landing pages pentru campanii, optimizarea conversiilor și automatizări.`,
];

const OWNERSHIP = "După 12 plăți lunare, website-ul devine al tău: îl poți păstra la noi cu mentenanță sau îl poți muta. Domeniul este al tău din prima zi.";
const OFFER = `Pentru clienții noi, prima lună pe planul Esențial costă 4,99 lei, cu codul GOLUNAR aplicat automat. Din luna a doua plătești ${E} lei pe lună.`;

const FAQ_COMMON: [string, string][] = [
  ["Există avans sau taxă de creare?", `Nu. Designul și dezvoltarea sunt incluse în abonament. La comandă plătești doar prima lună, iar pentru clienții noi prima lună pe planul Esențial costă 4,99 lei.`],
  ["Când devine website-ul al meu?", "După 12 plăți lunare și încheierea primei perioade de 12 luni. Domeniul este înregistrat pe firma ta din prima zi."],
  ["Ce se întâmplă dacă vreau să renunț?", "După perioada minimă a planului (3 luni la Esențial, 2 la Creștere, o lună la Partener) anulezi oricând. Abonamentul se oprește la finalul lunii deja plătite. Dacă vrei să păstrezi site-ul înainte de 12 luni, plătești ratele rămase și îl preiei."],
  ["Plătesc dobândă sau e un credit?", "Nu. Nu este un credit și nu implică o bancă sau un IFN. Plătești un abonament lunar pentru un serviciu, cu factură pe firmă, fără dobândă și fără verificare în Biroul de Credit."],
  ["În cât timp e gata site-ul?", "În 10 zile lucrătoare de la primirea brief-ului. Dacă întârziem din vina noastră, luna următoare de abonament este gratuită."],
];

export const RATE_PAGES: RatePage[] = [
  {
    slug: "site-in-rate",
    keyword: "site în rate",
    metaTitle: "Site în rate pentru firme, fără avans · LUNAR",
    desc: `Site în rate lunare pentru firma ta: fără avans, fără dobândă, lansare în 10 zile. De la ${E} lei pe lună, al tău după 12 plăți.`,
    eyebrow: "Site în rate",
    h1: "Site în rate pentru firma ta.",
    h1Dim: "Fără avans, fără dobândă, al tău după 12 plăți.",
    lede: "Un site făcut corect costă de obicei câteva mii de lei, plătiți la început. La LUNAR împărțim costul în rate lunare egale, iar în rată intră și tot ce ține site-ul în funcțiune: domeniu, hosting, mentenanță și îmbunătățiri.",
    sections: [
      { h: "Cum funcționează un site în rate la LUNAR", p: [
        "Alegi planul, completezi datele firmei și plătești prima rată. Primești acces în portal, unde completezi brief-ul. Din acel moment avem 10 zile lucrătoare să lansăm site-ul.",
        "Plătești apoi o rată lunară fixă, cu factură pe firmă. După 12 rate, website-ul devine al tău. Nu există dobândă, comision de acordare sau verificare la bancă, pentru că nu este un credit, ci un serviciu plătit lunar.",
      ] },
      { h: "Ce intră în rata lunară", ul: INCLUDES },
      { h: "Cât costă un site în rate", p: [OFFER], ul: PLANS_UL },
      { h: "De ce rate și nu plată integrală", p: [
        "Pentru o firmă mică, 4.000 sau 6.000 de lei plătiți la început înseamnă bani scoși din stoc, din salarii sau din reclame. O rată lunară îți lasă banii în firmă, iar costul site-ului se acoperă din clienții pe care îi aduce.",
        "Contează și ce primești după lansare. Multe site-uri plătite integral rămân neactualizate, fără backup și fără cineva care să răspundă când apare o problemă. În rata LUNAR, mentenanța și îmbunătățirile sunt incluse până la final.",
      ] },
      { h: "Pentru cine este potrivit", ul: [
        "Firme noi care au nevoie de un site profesionist din prima lună, fără să blocheze capitalul.",
        "Firme care au un site vechi, lent pe telefon, și vor să îl înlocuiască fără o cheltuială mare dintr-o dată.",
        "Clinici, saloane, cabinete, firme de servicii și construcții care primesc clienți din Google.",
        "Antreprenori care preferă un cost lunar previzibil, trecut pe cheltuieli, în locul unei investiții unice.",
      ] },
      { h: "Ce verifici la orice ofertă de site în rate", ul: [
        "Dacă site-ul devine al tău și după câte rate. La unele oferte nu devine niciodată.",
        "Dacă domeniul este înregistrat pe firma ta sau pe furnizor.",
        "Ce se întâmplă dacă renunți: pierzi tot sau poți prelua site-ul.",
        "Dacă hostingul, mentenanța și modificările sunt incluse sau se plătesc separat.",
        "Dacă primești factură fiscală pe firmă pentru fiecare rată.",
      ], p: [OWNERSHIP] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
  {
    slug: "website-in-rate",
    keyword: "website în rate",
    metaTitle: "Website în rate: plată lunară, fără avans · LUNAR",
    desc: `Website în rate pentru firme din România. Plătești lunar, fără avans și fără dobândă, iar după 12 plăți website-ul este al tău. De la ${E} lei pe lună.`,
    eyebrow: "Website în rate",
    h1: "Website în rate, cu plată lunară.",
    h1Dim: "Profesionist din prima lună, plătit pe parcurs.",
    lede: "Website-ul este primul lucru pe care îl verifică un client înainte să te sune. Cu plata în rate îl ai complet de la lansare, iar costul se împarte în 12 luni.",
    sections: [
      { h: "Trei moduri de a plăti un website", p: [
        "Plata integrală: plătești tot la început, de obicei între 3.000 și 10.000 de lei pentru un site de prezentare, iar mentenanța se plătește separat.",
        "Creditul sau leasingul: împarți costul, dar plătești dobândă, comisioane și treci printr-o verificare. Rar se aprobă pentru un serviciu digital.",
        "Abonamentul cu proprietate: plătești o rată lunară fixă fără dobândă, iar după 12 luni website-ul este al tău. Este modelul LUNAR.",
      ] },
      { h: "Ce primești de la prima rată", ul: INCLUDES },
      { h: "Prețuri pentru website în rate", p: [OFFER], ul: PLANS_UL },
      { h: "Cum decurge proiectul", ul: [
        "Ziua 0: comanzi online și plătești prima rată prin transfer bancar.",
        "Ziua 1: completezi brief-ul în portal, cu serviciile, clienții și exemplele care îți plac.",
        "Zilele 2–6: primești designul pe link și îl aprobi sau ceri modificări.",
        "Zilele 7–10: construim, testăm pe telefon și lansăm pe domeniul tău.",
        "După lansare: îmbunătățiri lunare, mentenanță și raport pe email.",
      ] },
      { h: "Website în rate pentru o firmă nouă", p: [
        "O firmă abia înființată are nevoie de credibilitate rapid, dar rar are bugetul pentru un site plătit integral. Rata lunară rezolvă ambele probleme: lansezi în două săptămâni și plătești din încasări.",
        OWNERSHIP,
      ] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
  {
    slug: "site-pe-abonament",
    keyword: "site pe abonament",
    metaTitle: "Site pe abonament lunar, cu proprietate · LUNAR",
    desc: `Site pe abonament lunar: design, domeniu, hosting, mentenanță și îmbunătățiri incluse. De la ${E} lei pe lună, iar după 12 plăți site-ul este al tău.`,
    eyebrow: "Site pe abonament",
    h1: "Site pe abonament lunar.",
    h1Dim: "Care devine al tău, nu rămâne închiriat.",
    lede: "Un abonament pentru site înseamnă că plătești lunar pentru un website complet și pentru tot ce îl ține la zi. Diferența LUNAR: după 12 plăți, site-ul este proprietatea ta.",
    sections: [
      { h: "Abonament cu proprietate, nu închiriere", p: [
        "La multe servicii de tip abonament, site-ul rămâne al furnizorului: dacă oprești plata, pierzi tot. La LUNAR, după 12 plăți lunare website-ul îți aparține și primești codul-sursă la cerere.",
        "Domeniul este înregistrat pe firma ta din prima zi, așa că adresa site-ului și emailurile pe domeniu rămân ale tale oricum.",
      ] },
      { h: "Ce include abonamentul", ul: INCLUDES },
      { h: "Planuri și prețuri", p: [OFFER], ul: PLANS_UL },
      { h: "Abonament față de plata unică", ul: [
        "Cost la început: abonamentul cere doar prima lună, plata unică cere tot bugetul.",
        "Mentenanță: inclusă în abonament, separată și adesea uitată la plata unică.",
        "Modificări: incluse lunar în abonament, facturate pe oră la plata unică.",
        "Proprietate: după 12 luni la LUNAR, imediat la plata unică.",
        "Risc: la abonament poți opri după perioada minimă, la plata unică banii sunt cheltuiți.",
      ] },
      { h: "Când merită un site pe abonament", p: [
        "Merită când vrei un site care evoluează: pagini noi pentru servicii, oferte sezoniere, SEO și măsurarea cererilor. Dacă ai nevoie doar de o pagină de contact pe care nu o atingi ani de zile, plata unică poate fi mai ieftină.",
      ] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
  {
    slug: "website-pe-abonament",
    keyword: "website pe abonament",
    metaTitle: "Website pe abonament (website as a service) · LUNAR",
    desc: "Website pe abonament pentru firme: un singur cost lunar pentru design, hosting, securitate, mentenanță și îmbunătățiri. Fără avans, al tău după 12 plăți.",
    eyebrow: "Website pe abonament",
    h1: "Website pe abonament.",
    h1Dim: "Un singur cost lunar pentru tot.",
    lede: "Modelul „website as a service” înlocuiește facturile separate pentru designer, hosting, domeniu și programator cu un abonament lunar. LUNAR adaugă un lucru pe care rar îl găsești: website-ul devine al tău după 12 plăți.",
    sections: [
      { h: "Ce înseamnă website as a service", p: [
        "În loc să cumperi un site o dată și apoi să cauți pe cineva pentru fiecare problemă, plătești un abonament care acoperă crearea, găzduirea și întreținerea. Furnizorul răspunde de funcționarea site-ului în fiecare lună.",
      ] },
      { h: "Ce acoperă abonamentul LUNAR", ul: INCLUDES },
      { h: "Costuri", p: [OFFER], ul: PLANS_UL },
      { h: "Cât te costă pe 3 ani", p: [
        `Pe planul Esențial, primele 12 luni costă în total ${fmt(4.99 + E * 11)} lei cu oferta de lansare, iar site-ul devine al tău. Din anul al doilea alegi: continui cu mentenanța și îmbunătățirile sau muți site-ul unde vrei.`,
        "La un site plătit integral, la prețul de creare se adaugă hostingul, domeniul, certificatul, actualizările și fiecare modificare cerută. Pe 3 ani, diferența este de obicei mai mică decât pare, iar la abonament ai pe cineva responsabil în fiecare lună.",
      ] },
      { h: "Pentru cine nu este potrivit", ul: [
        "Pentru magazinele online mari, cu mii de produse și integrări complexe, lucrăm pe ofertă separată.",
        "Pentru cine vrea să își administreze singur fiecare detaliu tehnic, o platformă de tip constructor poate fi suficientă.",
      ] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
  {
    slug: "site-cu-plata-lunara",
    keyword: "site cu plată lunară",
    metaTitle: `Site cu plată lunară de la ${E} lei, TVA inclus · LUNAR`,
    desc: `Site cu plată lunară pentru firme: o sumă fixă pe lună, factură pe firmă, fără avans. Domeniu, hosting și mentenanță incluse. De la ${E} lei pe lună.`,
    eyebrow: "Site cu plată lunară",
    h1: "Site cu plată lunară.",
    h1Dim: "O sumă fixă, fără surprize la factură.",
    lede: "Știi de la început cât plătești în fiecare lună și ce primești. Nu există costuri ascunse pentru hosting, certificat sau actualizări.",
    sections: [
      { h: "Cum plătești", p: [
        "Plata se face lunar prin transfer bancar, în lei, cu factură fiscală pe CUI-ul firmei. Primești datele de plată după comandă și înainte de fiecare scadență, iar în portal vezi toate ratele, plătite și viitoare.",
        "Dacă preferi, poți plăti tot anul o dată, cu 20% reducere. În acest caz website-ul devine al tău imediat după confirmarea plății.",
      ] },
      { h: "Ce acoperă plata lunară", ul: INCLUDES },
      { h: "Prețuri lunare", p: [OFFER], ul: PLANS_UL },
      { h: "Ce se întâmplă dacă întârzii o plată", p: [
        "Primești amintiri pe email în zilele 1, 5 și 10 după scadență. După 14 zile fără plată, site-ul poate fi suspendat temporar, până la plata ratei.",
      ] },
      { h: "Proprietate", p: [OWNERSHIP] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
  {
    slug: "site-fara-avans",
    keyword: "site fără avans",
    metaTitle: "Site fără avans și fără taxă de creare · LUNAR",
    desc: "Site pentru firma ta fără avans și fără taxă de creare. Plătești doar prima lună, iar pentru clienții noi prima lună pe Esențial costă 4,99 lei.",
    eyebrow: "Site fără avans",
    h1: "Site fără avans.",
    h1Dim: "Plătești doar prima lună, nu tot proiectul.",
    lede: "Majoritatea firmelor de web design cer un avans de 30–50% înainte să înceapă. La LUNAR nu există avans și nici taxă de creare: designul și dezvoltarea sunt incluse în abonament.",
    sections: [
      { h: "Cât plătești la început", p: [
        OFFER,
        `Pe planurile Creștere și Partener, la comandă plătești prima lună: ${G} lei, respectiv ${P} lei. Nu există alte sume de plătit înainte de lansare.`,
      ] },
      { h: "De ce putem lucra fără avans", p: [
        "Lucrăm cu un proces standardizat: brief în portal, design aprobat pe link, lansare în 10 zile lucrătoare. Costul nostru se recuperează în timp, din abonament, nu din avansul clientului.",
        "Riscul pentru tine este mic: dacă lansarea întârzie din vina noastră, luna următoare este gratuită, iar după perioada minimă poți anula oricând.",
      ] },
      { h: "Ce primești fără avans", ul: INCLUDES },
      { h: "Prețuri", ul: PLANS_UL },
      { h: "Proprietate", p: [OWNERSHIP] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
  {
    slug: "site-de-prezentare-in-rate",
    keyword: "site de prezentare în rate",
    metaTitle: "Site de prezentare în rate, lansat în 10 zile · LUNAR",
    desc: `Site de prezentare în rate pentru firme: pagini de servicii, contact, Google Maps și formular de ofertă. Fără avans, de la ${E} lei pe lună, al tău după 12 plăți.`,
    eyebrow: "Site de prezentare în rate",
    h1: "Site de prezentare în rate.",
    h1Dim: "Complet la lansare, plătit lunar.",
    lede: "Un site de prezentare bun răspunde rapid la trei întrebări ale clientului: ce faci, cât costă aproximativ și cum te contactează. Îl construim în 10 zile lucrătoare și îl plătești în rate.",
    sections: [
      { h: "Ce pagini are un site de prezentare", ul: [
        "Prima pagină, cu ce oferi, pentru cine și un buton clar de contact.",
        "Pagini separate pentru serviciile principale, ca fiecare să poată apărea în Google.",
        "Despre firmă, echipă și certificări, pentru încredere.",
        "Portofoliu sau galerie de lucrări, cu proiecte reale.",
        "Contact cu formular, telefon cu un clic, WhatsApp și hartă.",
        "Pagini legale: termeni, confidențialitate și cookie-uri.",
      ] },
      { h: "Ce intră în rată", ul: INCLUDES },
      { h: "Prețul unui site de prezentare în rate", p: [OFFER], ul: PLANS_UL },
      { h: "Site de prezentare care aduce cereri", p: [
        "Fiecare pagină are un singur scop: să ducă vizitatorul spre apel sau cerere de ofertă. Site-ul se încarcă rapid pe telefon, are datele firmei marcate pentru Google și poate fi legat de profilul Google Business.",
      ] },
      { h: "Proprietate", p: [OWNERSHIP] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
  {
    slug: "cat-costa-un-site-in-rate",
    keyword: "cât costă un site în rate",
    metaTitle: "Cât costă un site în rate în 2027 · LUNAR",
    desc: `Cât costă un site în rate: rata lunară, ce include și totalul pe 12 luni și 3 ani, comparat cu plata integrală. Calcul pentru planurile de la ${E} lei pe lună.`,
    eyebrow: "Cât costă un site în rate",
    h1: "Cât costă un site în rate.",
    h1Dim: "Calculul complet, pe 12 luni și pe 3 ani.",
    lede: "Rata lunară spune doar o parte din poveste. Ca să compari corect, uită-te la totalul pe 12 luni, la ce este inclus și la ce se întâmplă după.",
    sections: [
      { h: "Rata lunară pe fiecare plan", ul: PLANS_UL },
      { h: "Totalul pe primele 12 luni", ul: [
        `Esențial: ${fmt(4.99 + E * 11)} lei cu oferta de 4,99 lei în prima lună, sau ${fmt(E * 12)} lei fără ofertă.`,
        `Creștere: ${fmt(G * 12)} lei.`,
        `Partener: ${fmt(P * 12)} lei.`,
        `Cu plata anuală primești 20% reducere: de exemplu, ${fmt(Math.round(E * 12 * 0.8))} lei pe Esențial, iar site-ul devine al tău imediat.`,
      ] },
      { h: "Ce este inclus în aceste sume", ul: INCLUDES, p: ["Prețurile sunt finale, TVA inclus. Nu există taxă de creare, avans sau costuri separate pentru hosting și domeniu."] },
      { h: "Comparația cu un site plătit integral", p: [
        "Un site de prezentare făcut de o agenție costă de obicei între 3.000 și 10.000 de lei la început. La această sumă se adaugă anual hostingul și domeniul, de obicei câteva sute de lei, plus mentenanța și fiecare modificare, facturate separat.",
        "Pe 3 ani, diferența dintre cele două variante se reduce mult. Avantajul ratelor este că nu blochezi bani la început și ai pe cineva responsabil de site în fiecare lună.",
      ] },
      { h: "După 12 luni", p: [OWNERSHIP, "Dacă păstrezi site-ul la noi, continui cu același plan sau treci pe altul. Dacă îl muți, primești codul-sursă la cerere."] },
    ],
    faq: FAQ_COMMON,
    updated: UPDATED,
  },
];

export const ratePageBySlug = (slug: string) => RATE_PAGES.find((p) => p.slug === slug);
