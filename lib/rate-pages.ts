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
  /** Orașul, pentru paginile locale (areaServed în schema Service). */
  area?: string;
  /** Pagina publică „creare site <oraș>” legată de pagina locală. */
  related?: string;
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

const SHOP_INCLUDES = [
  "Magazin online cu design personalizat, gândit întâi pentru telefon, unde se fac majoritatea comenzilor.",
  "Catalog de produse cu categorii, filtre, variante (mărime, culoare) și căutare.",
  "Coș, checkout simplu și integrare cu procesatorul de plăți și curierul pe care le folosești.",
  "Pagini legale pentru comerț online: termeni, politica de retur, confidențialitate, ANPC și SAL.",
  "Domeniu .ro, hosting în Uniunea Europeană, certificat SSL, backup zilnic și monitorizare la fiecare 10 minute.",
  "Îmbunătățiri lunare incluse, factură pe firmă pentru fiecare plată, preț final cu TVA inclus.",
];


/** Pagini locale „site în rate <oraș>”: aceeași ofertă, context local scris separat pentru fiecare oraș. */
type CityRate = { slug: string; city: string; inCity: string; related: string; intro: string; local: string; areas: string[]; sectors: string[]; faq: [string, string][] };

const CITY_RATES: CityRate[] = [
  {
    slug: "site-in-rate-bucuresti", city: "București", inCity: "în București", related: "creare-site-bucuresti",
    intro: "În București, o firmă mică concurează pe aceeași căutare cu zeci de firme din același sector. Chiria, salariile și reclamele costă mai mult decât în restul țării, așa că mii de lei plătiți la început pentru un site sunt greu de justificat. Un site în rate rezolvă asta: plătești lunar, iar banii rămân în firmă.",
    local: "Căutările din București se fac des cu sectorul sau cartierul. Scriem conținutul pentru zonele în care lucrezi efectiv și includem localitățile din Ilfov, unde se mută tot mai multe firme și clienți.",
    areas: ["Toate cele 6 sectoare", "Pipera, Floreasca și Băneasa", "Militari, Drumul Taberei și Ghencea", "Titan, Berceni și Vitan", "Voluntari, Otopeni și Corbeanca", "Chiajna, Popești-Leordeni și Bragadiru"],
    sectors: ["Clinici și cabinete medicale", "Avocatură, contabilitate și consultanță", "Restaurante, cafenele și catering", "Construcții, amenajări și instalații", "Saloane, fitness și centre de înfrumusețare"],
    faq: [
      ["Pot lua un site în rate dacă firma are sediul în Ilfov?", "Da. Lucrăm cu firme din București și din tot județul Ilfov, cu aceleași prețuri și aceleași condiții. Factura se emite pe firma ta, indiferent de sediu."],
      ["Puteți optimiza site-ul pe un sector anume?", "Da. Construim conținutul în jurul sectorului și cartierelor în care ai clienți și conectăm site-ul cu profilul tău Google Business, ca să apari și în hartă."],
    ],
  },
  {
    slug: "site-in-rate-cluj", city: "Cluj-Napoca", inCity: "în Cluj-Napoca", related: "creare-site-cluj",
    intro: "Clienții din Cluj-Napoca compară mult online înainte să sune: verifică site-ul, recenziile și cât de repede răspunde firma. Un site vechi sau lent te scoate din listă din primele secunde. Cu un site în rate ai un site actual fără să plătești totul la început.",
    local: "Optimizăm pentru căutările din oraș și din zona metropolitană, unde locuiesc tot mai mulți dintre clienții tăi. Conținutul se scrie pe cartiere și localități reale, nu prin înlocuirea numelui orașului.",
    areas: ["Centru, Zorilor și Andrei Mureșanu", "Mărăști și Gheorgheni", "Mănăștur și Grigorescu", "Bună Ziua și Borhanci", "Florești", "Baciu, Apahida și Feleacu"],
    sectors: ["Clinici medicale și stomatologice", "Firme IT și servicii pentru companii", "Educație, cursuri și meditații", "Construcții și dezvoltare rezidențială", "Restaurante și cafenele"],
    faq: [
      ["Aveți birou în Cluj?", "Nu, lucrăm online cu firme din Cluj-Napoca și din toată țara: discuția pe Google Meet, brief-ul în portal, designul aprobat pe link. Așa păstrăm prețul mic și termenul de 10 zile lucrătoare."],
      ["Pot avea site-ul și în engleză?", "Da. Limba suplimentară se adaugă din abonament, cu traducere și actualizare lunară. E util dacă lucrezi cu clienți străini sau cu firme din IT."],
    ],
  },
  {
    slug: "site-in-rate-iasi", city: "Iași", inCity: "în Iași", related: "creare-site-iasi",
    intro: "În Iași, multe firme mici încă se bazează pe recomandări și pe o pagină de Facebook. Clienții noi caută însă pe Google, iar fără un site credibil ajung la concurență. Un site în rate îți dă un site profesionist cu o plată lunară previzibilă, fără avans.",
    local: "Scriem conținutul pentru cartierele din Iași și pentru localitățile din jur unde ai clienți. Pentru clinici, cabinete și centre educaționale, care sunt multe în oraș, structurăm site-ul în jurul programării sau al înscrierii.",
    areas: ["Centru și Copou", "Tătărași și Țicău", "Păcurari și Canta", "Nicolina și CUG", "Galata și Podu Roș", "Miroslava, Valea Lupului și Tomești"],
    sectors: ["Clinici medicale și stomatologice", "Educație, meditații și cursuri", "Servicii profesionale", "Restaurante și evenimente", "Construcții și amenajări"],
    faq: [
      ["Lucrați cu firme din Iași doar online?", "Da. Totul se face online, în 10 zile lucrătoare de la brief. Nu ai nevoie de întâlniri față în față, iar progresul îl vezi în portal."],
      ["Pot face programări sau înscrieri din site?", "Da. Pentru clinici, cabinete și centre educaționale includem formular de programare sau înscriere, cu notificare pe email la fiecare cerere."],
    ],
  },
  {
    slug: "site-in-rate-timisoara", city: "Timișoara", inCity: "în Timișoara", related: "creare-site-timisoara",
    intro: "Timișoara are multe firme B2B, de producție și servicii care lucrează cu parteneri din străinătate. Pentru ele, site-ul este primul document pe care îl vede un client nou. Un site în rate îți dă un site la nivelul partenerilor tăi fără o investiție mare la început.",
    local: "Optimizăm pentru căutările din Timișoara și din localitățile din jur, unde s-au mutat mulți clienți și firme. Pentru firmele care lucrează cu parteneri străini adăugăm versiunea în engleză sau germană.",
    areas: ["Centru și Cetate", "Fabric și Elisabetin", "Iosefin și Complexul Studențesc", "Circumvalațiunii și Dâmbovița", "Dumbrăvița și Giroc", "Ghiroda și Moșnița Nouă"],
    sectors: ["Firme B2B și producție", "Clinici medicale și stomatologice", "Servicii profesionale", "Restaurante și HoReCa", "Construcții și dezvoltare rezidențială"],
    faq: [
      ["Pot avea site-ul în engleză sau germană?", "Da. Fiecare limbă suplimentară este o versiune completă a site-ului, tradusă și actualizată lunar, cu un cost lunar separat afișat la comandă."],
      ["Aveți experiență cu firme B2B?", "Da. Pentru firme B2B construim site-ul în jurul cererii de ofertă: servicii clare, capabilități, certificări și un formular care cere exact informațiile de care ai nevoie ca să răspunzi."],
    ],
  },
  {
    slug: "site-in-rate-constanta", city: "Constanța", inCity: "în Constanța", related: "creare-site-constanta",
    intro: "În Constanța, multe afaceri depind de sezon. Banii intră vara, iar investițiile se fac înainte, când încasările sunt mici. Un site în rate se potrivește acestui ritm: îl lansezi înainte de sezon, plătești lunar și nu blochezi banii de care ai nevoie pentru pregătiri.",
    local: "Scriem conținutul pentru Constanța și pentru stațiunile din jur, unde caută turiștii. Pentru cazare și restaurante adăugăm versiuni în alte limbi și legături directe spre rezervare, telefon sau WhatsApp.",
    areas: ["Centru și Peninsula", "Tomis Nord și Tomis III", "Faleză Nord și Inel", "Mamaia și Năvodari", "Ovidiu și Lumina", "Eforie și Techirghiol"],
    sectors: ["Cazare și turism", "Restaurante și beach bar-uri", "Clinici și servicii medicale", "Logistică și servicii pentru port", "Construcții și amenajări"],
    faq: [
      ["Cât de devreme ar trebui să comand site-ul înainte de sezon?", "Lansarea are loc în 10 zile lucrătoare de la brief, dar Google are nevoie de câteva săptămâni să indexeze și să poziționeze paginile. Ideal comanzi cu 2 sau 3 luni înainte de sezon."],
      ["Pot primi rezervări din site?", "Da. Includem formular de rezervare sau legătura cu platforma de rezervări pe care o folosești deja, plus butoane de apel și WhatsApp pe mobil."],
    ],
  },
  {
    slug: "site-in-rate-brasov", city: "Brașov", inCity: "în Brașov", related: "creare-site-brasov",
    intro: "Brașovul combină turismul cu industria și serviciile pentru firme. Turiștii caută din telefon, iar clienții B2B verifică site-ul înainte de o cerere de ofertă. Un site în rate îți dă un site care servește ambele tipuri de clienți, fără o plată mare la început.",
    local: "Optimizăm pentru căutările din Brașov, Poiana Brașov și localitățile din jur. Pentru cazare și restaurante adăugăm versiuni în alte limbi, iar pentru firmele B2B structurăm site-ul în jurul cererii de ofertă.",
    areas: ["Centrul Vechi și Schei", "Tractorul și Coresi", "Răcădău și Astra", "Noua și Dârste", "Poiana Brașov", "Ghimbav, Sânpetru și Cristian"],
    sectors: ["Cazare și turism", "Restaurante și cafenele", "Clinici și servicii medicale", "Construcții și amenajări", "Industrie și firme B2B"],
    faq: [
      ["Pot avea site-ul în mai multe limbi pentru turiști?", "Da. Fiecare limbă suplimentară este o versiune completă a site-ului, menținută lunar. Pentru cazare recomandăm cel puțin engleza."],
      ["Lucrați și cu firme din afara orașului?", "Da. Lucrăm online cu firme din tot județul Brașov și din toată țara, cu aceleași prețuri și același termen de lansare."],
    ],
  },
];

const cityPage = (c: CityRate): RatePage => ({
  slug: c.slug,
  keyword: `site în rate ${c.city}`,
  metaTitle: `Site în rate ${c.city}, fără avans · LUNAR`,
  desc: `Site în rate ${c.inCity} pentru firme: fără avans și fără dobândă, lansare în 10 zile lucrătoare. De la ${E} lei pe lună, al tău după 12 plăți.`,
  eyebrow: `Site în rate ${c.city}`,
  h1: `Site în rate ${c.inCity}.`,
  h1Dim: "Fără avans, fără dobândă, al tău după 12 plăți.",
  lede: c.intro,
  sections: [
    { h: `Cum funcționează un site în rate ${c.inCity}`, p: [
      "Alegi planul, completezi datele firmei și plătești prima lună. Primești acces în portal, unde completezi brief-ul, iar din acel moment avem 10 zile lucrătoare să lansăm site-ul.",
      "Plătești apoi o rată lunară fixă, cu factură pe firmă. Nu este un credit: nu există dobândă, comision sau verificare la bancă. După 12 rate, site-ul devine al tău.",
    ] },
    { h: "Ce intră în rata lunară", ul: INCLUDES },
    { h: `Cât costă un site în rate ${c.inCity}`, p: [OFFER, "Prețurile sunt aceleași în toată țara și includ TVA. Nu există costuri de deplasare sau taxe locale, pentru că lucrăm online."], ul: PLANS_UL },
    { h: `Site în rate pentru firme din ${c.city} și împrejurimi`, p: [c.local], ul: c.areas },
    { h: `Domenii pentru care facem des site-uri ${c.inCity}`, ul: c.sectors },
    { h: "Proprietate și garanții", p: [OWNERSHIP, "Dacă lansarea depășește 10 zile lucrătoare de la brief din vina noastră, luna următoare de abonament este gratuită."] },
  ],
  faq: [...c.faq, ...FAQ_COMMON],
  updated: "2026-11-27",
  area: c.city,
  related: c.related,
});

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
      { h: "Ce intră în rata lunară a unui site în rate", ul: INCLUDES },
      { h: "Cât costă un site în rate", p: [OFFER], ul: PLANS_UL },
      { h: "De ce rate și nu plată integrală", p: [
        "Pentru o firmă mică, 4.000 sau 6.000 de lei plătiți la început înseamnă bani scoși din stoc, din salarii sau din reclame. O rată lunară îți lasă banii în firmă, iar costul site-ului se acoperă din clienții pe care îi aduce.",
        "Contează și ce primești după lansare. Multe site-uri plătite integral rămân neactualizate, fără backup și fără cineva care să răspundă când apare o problemă. În rata LUNAR, mentenanța și îmbunătățirile sunt incluse până la final.",
      ] },
      { h: "Pentru cine este potrivit un site în rate", ul: [
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
      { h: "Site în rate cu factură pe firmă", p: ["Fiecare rată a site-ului în rate este facturată pe CUI-ul firmei, cu prețul final, TVA inclus. Pentru contabilitate, abonamentul este o cheltuială lunară de servicii, ușor de urmărit.", "Toate ratele, plătite și viitoare, se văd în portalul clientului, împreună cu facturile și contractul. Știi oricând câte rate mai ai până când site-ul devine al tău."] },
    ],
    faq: [
      ["Pot plăti site-ul în rate și ca PFA?", "Da. Comanda se face pe CUI, iar persoanele fizice autorizate, întreprinderile individuale și firmele au același proces și aceleași prețuri."],
      ["Pot plăti site-ul în rate mai repede?", "Da. Poți plăti oricând ratele rămase până la 12 și preiei site-ul. Dacă alegi de la început plata anuală, primești 20% reducere."],
      ...FAQ_COMMON,
    ],
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
      { h: "Ce primești la un website în rate, de la prima rată", ul: INCLUDES },
      { h: "Prețuri pentru website în rate", p: [OFFER], ul: PLANS_UL },
      { h: "Cum decurge proiectul de website în rate", ul: [
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
      { h: "Website în rate sau constructor de site-uri", p: ["Un constructor de site-uri pare ieftin, dar construcția, textele, SEO-ul și întreținerea rămân în sarcina ta. La un website în rate LUNAR, le facem noi, iar tu plătești doar rata lunară.", "Diferența cea mai mare apare după lansare: la constructor plătești abonamentul pentru totdeauna, iar site-ul nu devine al tău. La LUNAR, după 12 rate, website-ul îți aparține."] },
    ],
    faq: [
      ["Ce diferență este între site în rate și website în rate?", "Niciuna: sunt două denumiri pentru același serviciu. Plătești lunar, fără avans, iar după 12 plăți website-ul devine al tău."],
      ["Pot avea website în rate în mai multe limbi?", "Da. Fiecare limbă suplimentară costă 149 lei pe lună și se adaugă la rata planului ales."],
      ...FAQ_COMMON,
    ],
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
      { h: "Ce include un site pe abonament LUNAR", ul: INCLUDES },
      { h: "Prețuri pentru site pe abonament", p: [OFFER], ul: PLANS_UL },
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
      { h: "Cum alegi un site pe abonament", p: ["Înainte să semnezi pentru orice site pe abonament, cere trei răspunsuri clare: al cui este site-ul după ce plătești, al cui este domeniul și ce se întâmplă cu site-ul dacă oprești abonamentul.", "La LUNAR, răspunsurile sunt scrise în termenii contractului: site-ul devine al tău după 12 plăți, domeniul este al tău din prima zi, iar după perioada minimă poți anula oricând."] },
    ],
    faq: [
      ["Pot schimba planul abonamentului?", "Da. Poți trece pe alt plan, iar diferența se aplică de la rata următoare, cu respectarea perioadei minime a noului plan."],
      ["Rămâne site-ul online dacă opresc abonamentul înainte de 12 luni?", "Nu, dacă nu preiei site-ul. Ai însă oricând varianta să plătești ratele rămase până la 12 și să îl păstrezi."],
      ...FAQ_COMMON,
    ],
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
      { h: "Ce acoperă un website pe abonament LUNAR", ul: INCLUDES },
      { h: "Cât costă un website pe abonament", p: [OFFER], ul: PLANS_UL },
      { h: "Cât te costă pe 3 ani", p: [
        `Pe planul Esențial, primele 12 luni costă în total ${fmt(4.99 + E * 11)} lei cu oferta de lansare, iar site-ul devine al tău. Din anul al doilea alegi: continui cu mentenanța și îmbunătățirile sau muți site-ul unde vrei.`,
        "La un site plătit integral, la prețul de creare se adaugă hostingul, domeniul, certificatul, actualizările și fiecare modificare cerută. Pe 3 ani, diferența este de obicei mai mică decât pare, iar la abonament ai pe cineva responsabil în fiecare lună.",
      ] },
      { h: "Pentru ce tip de site funcționează", p: [
        "Pentru orice tip de site: de prezentare, landing page pentru campanii sau magazin online. Prețul este același abonament, indiferent de tipul site-ului.",
      ] },
      { h: "De ce aleg firmele website pe abonament", p: ["Un website pe abonament mută responsabilitatea tehnică de pe firma ta pe furnizor. Nu mai cauți programator când apare o eroare, nu urmărești expirarea domeniului și nu plătești separat fiecare modificare.", "Pentru firmele care cresc, avantajul este flexibilitatea: începi cu planul Esențial și treci pe Creștere sau Partener când ai nevoie de SEO, campanii sau automatizări, fără să refaci site-ul."] },
    ],
    faq: [
      ["Ce este website as a service?", "Este modelul în care plătești lunar pentru crearea, găzduirea și întreținerea website-ului, în loc să îl cumperi o dată și să plătești separat fiecare serviciu."],
      ["Website pe abonament înseamnă că nu îl dețin?", "La multe servicii, da. La LUNAR, website-ul pe abonament devine al tău după 12 plăți."],
      ...FAQ_COMMON,
    ],
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
      { h: "Cum plătești un site cu plată lunară", p: [
        "Plata se face lunar prin transfer bancar, în lei, cu factură fiscală pe CUI-ul firmei. Primești datele de plată după comandă și înainte de fiecare scadență, iar în portal vezi toate ratele, plătite și viitoare.",
        "Dacă preferi, poți plăti tot anul o dată, cu 20% reducere. În acest caz website-ul devine al tău imediat după confirmarea plății.",
      ] },
      { h: "Ce acoperă plata lunară", ul: INCLUDES },
      { h: "Prețuri pentru site cu plată lunară", p: [OFFER], ul: PLANS_UL },
      { h: "Ce se întâmplă dacă întârzii o plată", p: [
        "Primești amintiri pe email în zilele 1, 5 și 10 după scadență. După 14 zile fără plată, site-ul poate fi suspendat temporar, până la plata ratei.",
      ] },
      { h: "Proprietate", p: [OWNERSHIP] },
      { h: "De ce un site cu plată lunară ajută bugetul", p: ["Un site cu plată lunară transformă o investiție mare într-un cost fix, la fel ca chiria sau contabilitatea. Știi din prima zi cât te costă site-ul în fiecare lună, iar suma nu crește când ai nevoie de modificări incluse în plan.", "Pentru firmele mici, previzibilitatea contează mai mult decât prețul total: banii rămân disponibili pentru stoc, oameni și reclame."] },
    ],
    faq: [
      ["Când se plătește rata lunară?", "În aceeași zi a fiecărei luni, aleasă la comandă. Primești un email înainte de scadență cu datele de plată și referința."],
      ["Pot plăti site-ul cu plată lunară prin card?", "Momentan plata se face prin transfer bancar. Plata cu cardul va fi disponibilă în curând."],
      ...FAQ_COMMON,
    ],
    updated: UPDATED,
  },
  {
    slug: "site-fara-avans",
    keyword: "site fără avans",
    metaTitle: "Site fără avans și fără taxă de creare · LUNAR",
    desc: "Site fără avans și fără taxă de creare pentru firma ta. Plătești doar prima lună: pentru clienții noi, prima lună pe Esențial costă 4,99 lei.",
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
      { h: "Ce primești la un site fără avans", ul: INCLUDES },
      { h: "Prețuri pentru site fără avans", ul: PLANS_UL },
      { h: "Proprietate", p: [OWNERSHIP] },
      { h: "Site fără avans: ce riști și ce nu", p: ["La un site fără avans, riscul principal al clientului dispare: nu plătești sume mari înainte să vezi designul. Aprobi designul pe link înainte de construcție, iar lansarea are termen garantat.", "Singurul angajament este perioada minimă a planului ales: 3 luni la Esențial, 2 la Creștere și o lună la Partener."] },
    ],
    faq: [
      ["De ce alte firme cer avans pentru site?", "Pentru că încasează proiectul o singură dată și vor să își acopere munca înainte de livrare. La LUNAR costul se recuperează lunar, din abonament."],
      ["Site fără avans înseamnă calitate mai slabă?", "Nu. Designul este personalizat, iar site-ul este construit pe aceeași tehnologie ca proiectele plătite integral. Diferă doar modul de plată."],
      ...FAQ_COMMON,
    ],
    updated: UPDATED,
  },
  {
    slug: "site-de-prezentare-in-rate",
    keyword: "site de prezentare în rate",
    metaTitle: "Site de prezentare în rate, lansat în 10 zile · LUNAR",
    desc: `Site de prezentare în rate: pagini de servicii, contact, hartă și formular de ofertă. Fără avans, de la ${E} lei pe lună, al tău după 12 plăți.`,
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
      { h: "Ce intră în rata unui site de prezentare în rate", ul: INCLUDES },
      { h: "Prețul unui site de prezentare în rate", p: [OFFER], ul: PLANS_UL },
      { h: "Site de prezentare în rate care aduce cereri", p: [
        "Fiecare pagină are un singur scop: să ducă vizitatorul spre apel sau cerere de ofertă. Site-ul se încarcă rapid pe telefon, are datele firmei marcate pentru Google și poate fi legat de profilul Google Business.",
      ] },
      { h: "Proprietate", p: [OWNERSHIP] },
      { h: "Când ai nevoie de un site de prezentare în rate", p: ["Un site de prezentare în rate se potrivește firmelor de servicii: clinici, cabinete, saloane, construcții, consultanță, transport. Clientul vrea să vadă rapid ce faci, unde ești și cum te contactează.", "Dacă vinzi produse online, varianta potrivită este un magazin online, la același preț de abonament."] },
    ],
    faq: [
      ["Câte pagini are un site de prezentare în rate?", "Câte are nevoie afacerea ta, de obicei între 5 și 12 pagini, stabilite împreună în brief. Paginile noi se adaugă apoi din îmbunătățirile lunare."],
      ["Pot muta site-ul de prezentare existent?", "Da, gratuit. Preluăm textele, imaginile și paginile importante și facem redirecturi de pe adresele vechi."],
      ...FAQ_COMMON,
    ],
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
      { h: "Cât costă un site în rate pe fiecare plan", ul: PLANS_UL },
      { h: "Cât costă un site în rate în primele 12 luni", ul: [
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
      { h: "Ce poate crește costul unui site în rate", p: ["Costul unui site în rate crește doar dacă adaugi opțiuni: identitate vizuală (399 lei pe lună, timp de 12 luni), vizibilitate locală Google (99 lei pe lună), vizibilitate în AI pe planul Esențial (99 lei pe lună) sau limbi suplimentare (149 lei pe lună pentru fiecare).", "Fără opțiuni, rata rămâne cea a planului. Nu există taxe de setup, de lansare sau de transfer al proprietății."] },
    ],
    faq: [
      ["Cât costă un site în rate pe lună?", "Între 269 și 1379 de lei pe lună, în funcție de plan, TVA inclus. Prima lună pe planul Esențial costă 4,99 lei pentru clienții noi."],
      ["Cât costă în total un site în rate?", "Pe planul Esențial, primele 12 luni costă 2.963,99 lei cu oferta de lansare. După aceste 12 plăți, site-ul este al tău."],
      ...FAQ_COMMON,
    ],
    updated: UPDATED,
  },
  {
    slug: "magazin-online-in-rate",
    keyword: "magazin online în rate",
    metaTitle: "Magazin online în rate, fără avans · LUNAR",
    desc: `Magazin online în rate pentru firma ta: fără avans, fără dobândă, al tău după 12 plăți. Hosting, mentenanță și îmbunătățiri incluse, de la ${E} lei pe lună.`,
    eyebrow: "Magazin online în rate",
    h1: "Magazin online în rate.",
    h1Dim: "Începi să vinzi fără să plătești tot proiectul la început.",
    lede: "Un magazin online făcut la comandă costă de obicei de la câteva mii până la zeci de mii de lei, plătiți înainte de prima vânzare. La LUNAR plătești un abonament lunar, iar după 12 plăți magazinul este al tău.",
    sections: [
      { h: "Cum funcționează un magazin online în rate", p: [
        "Alegi planul, plătești prima lună și completezi brief-ul în portal: ce vinzi, câte produse ai, cum livrezi și cum vrei să încasezi. Lansăm în 10 zile lucrătoare de la brief, iar produsele le încărcăm împreună cu tine.",
        "Plătești apoi o rată lunară fixă, fără dobândă și fără verificare la bancă, pentru că nu este un credit. Prețul este același ca pentru orice site LUNAR: plătești abonamentul, indiferent de tipul site-ului.",
      ] },
      { h: "Ce include un magazin online în rate", ul: SHOP_INCLUDES },
      { h: "Cât costă un magazin online în rate", p: [OFFER], ul: PLANS_UL },
      { h: "Ce plan se potrivește unui magazin", ul: [
        "Esențial, dacă ai puține produse și vrei să începi să vinzi online repede.",
        "Creștere, dacă vrei trafic din Google pe categorii și produse, plus măsurarea vânzărilor din reclame.",
        "Partener, dacă rulezi campanii constant și ai nevoie de landing pages, optimizarea conversiilor și automatizări.",
      ] },
      { h: "De ce rate și nu plată integrală", p: [
        "La un magazin nou, banii sunt mai utili în stoc și în reclame decât blocați în dezvoltare. Cu rata lunară începi să vinzi în două săptămâni, iar costul magazinului se acoperă din comenzi.",
        OWNERSHIP,
      ] },
      { h: "Magazin online în rate sau platformă de comerț", p: ["Pe o platformă de comerț plătești lunar pentru totdeauna, adesea cu comision din vânzări, iar magazinul nu devine al tău. La un magazin online în rate LUNAR, rata este fixă, fără comision pe comenzi, iar după 12 plăți magazinul îți aparține.", "Și designul diferă: magazinul tău nu pornește dintr-o temă folosită de mii de alte magazine."] },
    ],
    faq: [
      ["Pot muta un magazin online existent?", "Da. Mutarea unui magazin cu comenzi și conturi de clienți o discutăm înainte de comandă, ca să stabilim ce date se preiau."],
      ["Primesc factură pentru fiecare rată a magazinului online?", "Da. Fiecare rată este facturată pe CUI-ul firmei, cu prețul final, TVA inclus."],
      ["Costă mai mult un magazin online decât un site de prezentare?", "Nu. Prețul este același abonament, indiferent de tipul site-ului. Diferă doar planul pe care îl alegi, în funcție de ce ai nevoie lunar."],
      ...FAQ_COMMON,
    ],
    updated: UPDATED,
  },
  {
    slug: "magazin-online-pe-abonament",
    keyword: "magazin online pe abonament",
    metaTitle: "Magazin online pe abonament lunar · LUNAR",
    desc: `Magazin online pe abonament: design, hosting, securitate, mentenanță și îmbunătățiri într-un singur cost lunar. De la ${E} lei pe lună, al tău după 12 plăți.`,
    eyebrow: "Magazin online pe abonament",
    h1: "Magazin online pe abonament.",
    h1Dim: "Fără comisioane pe vânzări, fără să rămână închiriat.",
    lede: "Platformele de magazine pe abonament te țin legat de ele pentru totdeauna și adesea iau comision din fiecare vânzare. La LUNAR plătești un abonament fix, fără comision pe comenzi, iar după 12 plăți magazinul este al tău.",
    sections: [
      { h: "Abonament LUNAR față de o platformă de magazine", ul: [
        "Proprietate: la LUNAR magazinul devine al tău după 12 plăți; pe o platformă rămâne închiriat.",
        "Comisioane: LUNAR nu ia comision din vânzări; abonamentul este fix.",
        "Design: la LUNAR este făcut pentru brandul tău, nu ales dintr-o listă de teme.",
        "Muncă: la LUNAR construim și întreținem noi magazinul; pe o platformă îl configurezi singur.",
      ] },
      { h: "Ce include un magazin online pe abonament", ul: SHOP_INCLUDES },
      { h: "Cât costă un magazin online pe abonament", p: [OFFER], ul: PLANS_UL },
      { h: "Proprietate", p: [OWNERSHIP, "Comisioanele procesatorului de plăți și tarifele curierului se plătesc direct către aceștia, ca la orice magazin online."] },
      { h: "Pentru cine este un magazin online pe abonament", p: ["Un magazin online pe abonament se potrivește firmelor care vând deja offline și vor să înceapă online fără o investiție mare, producătorilor locali și brandurilor mici care vor un magazin propriu în locul unui marketplace.", "Pe un marketplace concurezi pe aceeași pagină cu alți vânzători. În magazinul tău, clientul vede doar produsele tale."] },
    ],
    faq: [
      ["Ce plăți online pot accepta?", "Integrăm procesatorul de plăți pe care îl folosești sau pe care îl alegi, plus plata la livrare. Comisioanele procesatorului se plătesc direct către acesta."],
      ["Pot schimba planul magazinului online pe abonament?", "Da. Poți trece pe alt plan, iar diferența se aplică de la rata următoare."],
      ...FAQ_COMMON,
    ],
    updated: UPDATED,
  },
  {
    slug: "cat-costa-un-magazin-online",
    keyword: "cât costă un magazin online",
    metaTitle: "Cât costă un magazin online în 2027 · LUNAR",
    desc: `Cât costă un magazin online: dezvoltare, hosting, plăți, curierat și mentenanță. Varianta în rate de la ${E} lei pe lună, comparată cu plata integrală.`,
    eyebrow: "Cât costă un magazin online",
    h1: "Cât costă un magazin online.",
    h1Dim: "Toate costurile, nu doar prețul de creare.",
    lede: "Prețul de creare este doar începutul. Un magazin online are costuri lunare de găzduire, securitate, actualizări și modificări, plus comisioanele de plată și livrare. Iată calculul complet.",
    sections: [
      { h: "Din ce se compune costul unui magazin online", ul: [
        "Dezvoltarea: designul, catalogul, coșul, checkout-ul și integrările.",
        "Domeniul și hostingul, plătite anual sau lunar.",
        "Mentenanța: actualizări de securitate, backup și verificarea că plățile funcționează.",
        "Modificările: produse noi, campanii, pagini sezoniere.",
        "Comisioanele procesatorului de plăți și tarifele curierului, plătite direct către aceștia.",
      ] },
      { h: "Varianta LUNAR: un abonament pentru tot", p: [OFFER, "Prețul este același ca pentru orice site LUNAR: abonamentul nu crește pentru că site-ul este un magazin."], ul: PLANS_UL },
      { h: "Totalul pe primele 12 luni", ul: [
        `Esențial: ${fmt(4.99 + E * 11)} lei cu oferta de 4,99 lei în prima lună.`,
        `Creștere: ${fmt(G * 12)} lei.`,
        `Partener: ${fmt(P * 12)} lei.`,
        "Cu plata anuală primești 20% reducere, iar magazinul devine al tău imediat după plată.",
      ] },
      { h: "Ce este inclus în costul unui magazin online LUNAR", ul: SHOP_INCLUDES },
      { h: "Cât costă un magazin online plătit integral", p: [
        "La plata integrală, dezvoltarea unui magazin la comandă se plătește înainte de lansare, iar mentenanța și modificările se facturează separat după aceea. În abonament, toate acestea sunt incluse și împărțite în rate egale.",
        OWNERSHIP,
      ] },
      { h: "De la ce depinde cât costă un magazin online", p: ["Prețul unui magazin online plătit integral depinde de numărul de produse, de integrări (facturare, stoc, curier), de designul personalizat și de cine încarcă produsele. De aceea ofertele diferă atât de mult de la o firmă la alta.", "La LUNAR costul nu depinde de aceste lucruri: plătești abonamentul planului ales, iar munca se împarte în îmbunătățirile lunare incluse."] },
    ],
    faq: [
      ["Cât costă un magazin online pe lună?", "La LUNAR, între 269 și 1.379 de lei pe lună, TVA inclus, în funcție de plan. Prima lună pe Esențial costă 4,99 lei pentru clienții noi."],
      ["Cât costă un magazin online mic?", "Un magazin cu puține produse poate porni pe planul Esențial, la 269 de lei pe lună, fără avans și fără taxă de creare."],
      ["Plătesc comision din vânzări către LUNAR?", "Nu. Plătești doar abonamentul lunar. Comisioanele de plată și livrare merg direct la procesatorul de plăți și la curier."],
      ...FAQ_COMMON,
    ],
    updated: UPDATED,
  },
  {
    slug: "creare-magazin-online-in-rate",
    keyword: "creare magazin online în rate",
    metaTitle: "Creare magazin online în rate, lansat în 10 zile · LUNAR",
    desc: `Creare magazin online în rate: fără avans, fără dobândă, lansare în 10 zile lucrătoare de la brief. De la ${E} lei pe lună, al tău după 12 plăți.`,
    eyebrow: "Creare magazin online în rate",
    h1: "Creare magazin online în rate.",
    h1Dim: "De la brief la prima comandă în 10 zile lucrătoare.",
    lede: "Îți construim magazinul online pe brandul tău și îl plătești lunar. Fără avans, fără taxă de creare și fără să cauți separat hosting, programator sau pe cineva pentru mentenanță.",
    sections: [
      { h: "Cum decurge crearea unui magazin online în rate", ul: [
        "Comanzi online și plătești prima lună.",
        "Completezi brief-ul în portal: produse, categorii, livrare, plăți și exemple de magazine care îți plac.",
        "Primești designul pe link și îl aprobi sau ceri modificări.",
        "Construim magazinul, conectăm plățile și livrarea și testăm o comandă completă pe telefon.",
        "Lansăm pe domeniul tău. După lansare, îmbunătățirile lunare sunt incluse.",
      ] },
      { h: "Ce include crearea magazinului online", ul: SHOP_INCLUDES },
      { h: "Prețuri pentru creare magazin online în rate", p: [OFFER], ul: PLANS_UL },
      { h: "Garanția de lansare", p: [
        "Dacă lansarea depășește 10 zile lucrătoare de la brief din vina noastră, luna următoare de abonament este gratuită. Zilele în care așteptăm produse sau materiale de la tine nu se numără.",
        OWNERSHIP,
      ] },
      { h: "Ce pregătești înainte de creare", p: ["Crearea unui magazin online în rate merge cel mai repede când ai pregătite lista de produse cu prețuri, fotografiile, condițiile de livrare și retur și datele procesatorului de plăți.", "Dacă nu le ai pe toate, începem cu ce există: lansăm cu produsele principale și adăugăm restul din îmbunătățirile lunare."] },
    ],
    faq: [
      ["Cine încarcă produsele în magazin?", "Le încărcăm împreună: tu ne dai lista și fotografiile, noi le structurăm în categorii și le publicăm. Produsele noi se adaugă apoi din îmbunătățirile lunare."],
      ["Cât durează crearea unui magazin online?", "10 zile lucrătoare de la brief. Zilele în care așteptăm produse sau materiale de la tine nu se numără."],
      ...FAQ_COMMON,
    ],
    updated: UPDATED,
  },
  ...CITY_RATES.map(cityPage),
];

export const ratePageBySlug = (slug: string) => RATE_PAGES.find((p) => p.slug === slug);
