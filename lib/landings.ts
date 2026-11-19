import type { PlanCode } from "@/lib/plans";

export type Industry = {
  kind: "industry";
  slug: string;
  keyword: string;
  name: string; // ex. „clinici stomatologice”
  short: string; // pentru footer
  metaTitle: string;
  desc: string;
  h1: string;
  h1Dim: string;
  lede: string;
  pains: string[];
  features: [string, string][];
  pages: string[];
  plan: PlanCode;
  planWhy: string;
  integrations: string[];
  seo: string[];
  faq: [string, string][];
  updated: string;
};

export type City = {
  kind: "city";
  slug: string;
  keyword: string;
  city: string;
  inCity: string; // „în București”
  metaTitle: string;
  desc: string;
  h1: string;
  h1Dim: string;
  lede: string;
  market: string[];
  areas: string[];
  sectors: string[];
  localSeo: string[];
  faq: [string, string][];
  updated: string;
};

export const INDUSTRIES: Industry[] = [
  {
    kind: "industry",
    slug: "site-clinica-stomatologica",
    keyword: "site clinică stomatologică",
    name: "clinici stomatologice",
    short: "Clinici stomatologice",
    metaTitle: "Site clinică stomatologică cu programări online · LUNAR",
    desc: "Site pentru clinică stomatologică cu programare online, prețuri clare și SEO local. Lansare în 10 zile, abonament lunar, al tău după 12 plăți.",
    h1: "Site pentru clinică stomatologică.",
    h1Dim: "Care umple agenda, nu doar arată bine.",
    lede: "Pacienții aleg dentistul de pe telefon, după recenzii, prețuri și cât de ușor pot face o programare. Construim site-ul clinicii tale în jurul acestui drum.",
    pains: [
      "Pacienții sună doar ca să întrebe prețuri, iar recepția pierde timp cu aceleași răspunsuri.",
      "Clinica nu apare în Google Maps pentru „dentist” și numele cartierului.",
      "Site-ul vechi nu se încarcă bine pe telefon și nu are buton de programare vizibil.",
      "Campaniile de reclame trimit oameni pe pagina principală, unde nu găsesc tratamentul căutat.",
    ],
    features: [
      ["Programare online", "Formular scurt sau integrare cu sistemul de programări pe care îl folosești deja. Pacientul alege tratamentul și intervalul preferat."],
      ["Pagină pentru fiecare tratament", "Implanturi, ortodonție, albire, pedodonție, estetică. Fiecare cu pași, durată, preț de pornire și întrebări frecvente: exact ce caută oamenii în Google."],
      ["Medicii și echipa", "Profiluri cu specializare, competențe și fotografie. Încrederea începe cu omul care tratează."],
      ["Prețuri și finanțare", "Listă de prețuri orientative și opțiunile de plată în rate, dacă le oferi. Mai puține telefoane doar pentru preț."],
      ["Înainte și după", "Galerie de cazuri, publicată doar cu acordul scris al pacienților și fără date care îi identifică."],
      ["Urgențe", "Număr de telefon fix vizibil pe mobil și program pentru urgențe, cu apel direct dintr-o atingere."],
    ],
    pages: ["Acasă", "Tratamente (o pagină pentru fiecare)", "Medici", "Prețuri", "Cazuri înainte și după", "Programare", "Contact și hartă", "Blog cu sfaturi de igienă"],
    plan: "growth",
    planWhy: "Planul Creștere include SEO pe fiecare tratament, vizibilitate în răspunsurile AI și tracking de conversii, ca să știi câte programări aduce site-ul. Două îmbunătățiri pe lună acoperă ofertele de sezon și tratamentele noi.",
    integrations: ["Google Business Profile", "Google Ads cu urmărirea programărilor", "WhatsApp Business", "Sistemul tău de programări, dacă are integrare"],
    seo: ["Date structurate Dentist și MedicalProcedure", "Pagini pentru „implant dentar”, „aparat dentar” și numele orașului", "Recenzii Google afișate pe site", "Viteză mare pe mobil, unde caută majoritatea pacienților"],
    faq: [
      ["Cât costă un site pentru o clinică stomatologică?", "La LUNAR începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. Recomandăm planul Creștere, de 790 lei pe lună, pentru SEO pe tratamente și urmărirea programărilor."],
      ["Puteți integra programările cu softul clinicii?", "Da, dacă softul are un modul de programări online sau o integrare publică. Altfel, programările ajung pe email și în WhatsApp, iar recepția le confirmă."],
      ["Putem publica fotografii înainte și după?", "Da, doar cu acordul scris al pacientului și fără elemente care îl identifică. Includem în site mențiunea despre consimțământ."],
      ["Cât durează până apare clinica în Google?", "Pagina principală se indexează de obicei în câteva zile. Pozițiile bune pe tratamente și în Maps se construiesc în câteva luni, cu conținut și recenzii."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "industry",
    slug: "site-salon-infrumusetare",
    keyword: "site salon de înfrumusețare",
    name: "saloane de înfrumusețare",
    short: "Saloane de înfrumusețare",
    metaTitle: "Site salon de înfrumusețare cu programări online · LUNAR",
    desc: "Site pentru salon de înfrumusețare, coafor sau salon de unghii, cu programări online, prețuri și galerie. Lansare în 10 zile, abonament lunar.",
    h1: "Site pentru salon de înfrumusețare.",
    h1Dim: "Programări și când salonul e închis.",
    lede: "Clientele te descoperă pe Instagram, dar te aleg când văd prețurile, lucrările și un loc liber în calendar. Site-ul tău face legătura dintre cele două.",
    pains: [
      "Programările vin în mesaje pe Instagram și WhatsApp, răspunzi seara târziu.",
      "Clientele noi nu găsesc prețurile și renunță.",
      "Salonul depinde complet de o rețea socială pe care nu o controlezi.",
      "Nu știi câte cliente vin din Google și câte din recomandări.",
    ],
    features: [
      ["Programare online", "Integrare cu aplicația de programări pe care o folosești sau un formular simplu: serviciu, specialist, interval."],
      ["Servicii și prețuri", "Coafură, manichiură, cosmetică, gene, sprâncene. Fiecare cu durată și preț, ușor de actualizat lunar."],
      ["Portofoliu de lucrări", "Galerie rapidă, legată de Instagram, cu lucrările reale ale echipei."],
      ["Echipa", "Fiecare specialist cu servicii, experiență și link direct de programare."],
      ["Vouchere cadou", "Pagină pentru carduri cadou, utilă de sărbători și de 8 Martie."],
      ["Recenzii", "Recenziile din Google afișate pe site, cu link spre profilul salonului."],
    ],
    pages: ["Acasă", "Servicii și prețuri", "Echipa", "Portofoliu", "Programare", "Vouchere cadou", "Contact și hartă"],
    plan: "essential",
    planWhy: "Planul Esențial acoperă un salon cu o singură locație: site personalizat, programări, hosting și o îmbunătățire pe lună pentru prețuri și oferte noi. Treci la Creștere când vrei SEO pe fiecare serviciu.",
    integrations: ["Aplicația de programări folosită de salon", "Instagram", "Google Business Profile", "WhatsApp Business"],
    seo: ["Date structurate BeautySalon cu program și prețuri", "Pagini pentru serviciile căutate în orașul tău", "Imagini optimizate pentru încărcare rapidă", "Profil Google sincronizat cu site-ul"],
    faq: [
      ["Am nevoie de site dacă am Instagram?", "Da. Instagram aduce atenția, dar nu apare în Google la „salon manichiură” și numele cartierului, iar algoritmul se poate schimba oricând. Site-ul e canalul pe care îl controlezi."],
      ["Pot schimba singură prețurile?", "Ne trimiți lista nouă din portal și o actualizăm în 48 de ore lucrătoare, inclusă în îmbunătățirea lunară."],
      ["Cât costă un site pentru salon?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. După 12 plăți, site-ul e al tău."],
      ["Puteți vinde vouchere online?", "Da, cu plată cu cardul. Necesită planul Creștere sau o îmbunătățire dedicată pentru configurarea plăților."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "industry",
    slug: "site-restaurant",
    keyword: "site restaurant",
    name: "restaurante",
    short: "Restaurante",
    metaTitle: "Site restaurant cu meniu online și rezervări · LUNAR",
    desc: "Site pentru restaurant, bistro sau cafenea: meniu online ușor de actualizat, rezervări, comenzi și SEO local. Lansare în 10 zile, abonament lunar.",
    h1: "Site pentru restaurant.",
    h1Dim: "Meniu, rezervări, clienți care revin.",
    lede: "Înainte să intre pe ușă, oamenii îți caută meniul, programul și pozele pe telefon. Un site rapid, cu meniul la zi, transformă căutarea în rezervare.",
    pains: [
      "Meniul de pe site e un PDF vechi, greu de citit pe telefon.",
      "Platformele de livrare iau comision din fiecare comandă.",
      "Rezervările vin la telefon în orele aglomerate.",
      "Turiștii nu găsesc meniul în engleză.",
    ],
    features: [
      ["Meniu online", "Pe categorii, cu prețuri, alergeni și poze. Se încarcă instant pe telefon, nu ca PDF."],
      ["Rezervări", "Formular cu dată, oră și număr de persoane sau integrare cu platforma de rezervări folosită."],
      ["Comenzi directe", "Link către comanda proprie sau către platformele de livrare, după caz."],
      ["Evenimente", "Pagini pentru botezuri, aniversări și evenimente corporate, cu formular de ofertă."],
      ["Mai multe limbi", "Meniu și pagini în engleză pentru turiști, prin opțiunea de limbă suplimentară."],
      ["Program și locație", "Program actualizat, hartă și parcare, vizibile din prima secundă."],
    ],
    pages: ["Acasă", "Meniu", "Rezervări", "Evenimente private", "Galerie", "Despre noi", "Contact și hartă"],
    plan: "growth",
    planWhy: "Planul Creștere include două îmbunătățiri pe lună pentru meniul de sezon și evenimente, plus SEO local și urmărirea rezervărilor. Pentru turiști, adaugă opțiunea de limbă suplimentară.",
    integrations: ["Platforma de rezervări", "Platformele de livrare", "Google Business Profile cu meniu", "Instagram"],
    seo: ["Date structurate Restaurant cu meniu, program și bucătărie", "Pagini pentru evenimente private", "Meniu text indexabil, nu PDF", "Poze optimizate pentru viteză"],
    faq: [
      ["Cât de des pot schimba meniul?", "Oricând. Modificările de meniu intră în îmbunătățirile lunare și le livrăm în 48 de ore lucrătoare."],
      ["Puteți afișa alergenii?", "Da, pe fiecare preparat, conform obligației de informare a consumatorilor."],
      ["Site-ul poate primi comenzi fără comision?", "Da, prin comandă directă cu plata la livrare sau cu cardul. Discutăm varianta potrivită volumului tău."],
      ["Cât costă un site pentru restaurant?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus. Recomandăm Creștere, de 790 lei pe lună, pentru meniul de sezon și SEO local."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "industry",
    slug: "site-avocat",
    keyword: "site avocat",
    name: "avocați și cabinete de avocatură",
    short: "Avocați",
    metaTitle: "Site avocat și cabinet de avocatură · LUNAR",
    desc: "Site pentru avocat sau cabinet de avocatură, conform regulilor profesiei: arii de practică, echipă, programare consultație. Lansare în 10 zile.",
    h1: "Site pentru avocat.",
    h1Dim: "Serios, clar, conform regulilor profesiei.",
    lede: "Clienții caută un avocat când au o problemă urgentă. Vor să înțeleagă repede dacă te ocupi de cazul lor și cum ajung la o consultație.",
    pains: [
      "Site-ul nu explică pe înțeles ariile de practică.",
      "Potențialii clienți nu știu cum se programează o consultație.",
      "Cabinetul nu apare când cineva caută ariile de practică în orașul tău.",
      "Teama de a încălca regulile de publicitate ale profesiei.",
    ],
    features: [
      ["Arii de practică", "O pagină pentru fiecare arie: dreptul familiei, penal, comercial, imobiliar, muncii. Explicate pentru clienți, nu pentru colegi."],
      ["Echipa", "Avocații cu baroul, experiența și domeniile principale."],
      ["Programare consultație", "Formular confidențial, cu acord GDPR, și opțiune de consultație online."],
      ["Articole juridice", "Explicații despre întrebările frecvente ale clienților, care aduc trafic din Google."],
      ["Conformitate", "Texte formulate informativ, fără promisiuni de rezultat și fără comparații cu alți avocați."],
      ["Confidențialitate", "Formulare securizate, date găzduite în UE, politică de confidențialitate clară."],
    ],
    pages: ["Acasă", "Arii de practică (o pagină pentru fiecare)", "Echipa", "Consultație", "Articole", "Contact"],
    plan: "growth",
    planWhy: "Planul Creștere include SEO pe fiecare arie de practică și vizibilitate în răspunsurile AI, unde oamenii pun tot mai des întrebări juridice. Două îmbunătățiri pe lună acoperă articolele noi.",
    integrations: ["Calendar pentru consultații", "Google Business Profile", "Email pe domeniu cu autentificare SPF și DKIM"],
    seo: ["Date structurate LegalService și Attorney", "Pagini pe arii de practică și oraș", "Articole care răspund întrebărilor reale ale clienților", "Pagini rapide și accesibile"],
    faq: [
      ["Respectă site-ul regulile de publicitate ale profesiei?", "Scriem texte informative, fără promisiuni de rezultat sau comparații. Verificarea finală a conformității îți aparține, ca titular al cabinetului."],
      ["Puteți scrie articolele juridice?", "Redactăm structura și varianta inițială pe baza notelor tale. Conținutul juridic îl validezi tu înainte de publicare."],
      ["Datele din formulare sunt în siguranță?", "Da. Folosim HTTPS, găzduire în UE și trimitem mesajele direct pe emailul cabinetului."],
      ["Cât costă un site pentru avocat?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. Al tău după 12 plăți."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "industry",
    slug: "site-firma-constructii",
    keyword: "site firmă construcții",
    name: "firme de construcții și renovări",
    short: "Construcții și renovări",
    metaTitle: "Site firmă de construcții și renovări · LUNAR",
    desc: "Site pentru firmă de construcții, renovări sau instalații: portofoliu de lucrări, cerere de ofertă și SEO local. Lansare în 10 zile, abonament lunar.",
    h1: "Site pentru firmă de construcții.",
    h1Dim: "Lucrările tale aduc următoarele oferte.",
    lede: "Cine renovează sau construiește vrea să vadă lucrări reale, să înțeleagă cum lucrezi și să ceară o ofertă fără zece telefoane.",
    pains: [
      "Cererile de ofertă vin fără detalii și pierzi timp cu deplasări inutile.",
      "Lucrările bune stau în telefonul tău, nu pe site.",
      "Concurența apare înaintea ta în Google pentru serviciile din zonă.",
      "Clienții mari cer un site serios înainte să te invite la licitație.",
    ],
    features: [
      ["Cerere de ofertă detaliată", "Tip lucrare, suprafață, localitate, termen, poze încărcate de client. Primești cereri pe care le poți estima."],
      ["Portofoliu de proiecte", "Fiecare proiect cu înainte și după, descriere, durată și localitate."],
      ["Servicii", "Construcții la roșu, renovări, amenajări, instalații, acoperișuri. Pagini separate pentru fiecare."],
      ["Zona de lucru", "Localitățile în care lucrezi, pentru clienți și pentru Google."],
      ["Certificări și garanții", "Autorizații, asigurări și garanția lucrărilor, la vedere."],
      ["Procesul de lucru", "Pașii de la ofertă la recepție. Clientul știe la ce să se aștepte."],
    ],
    pages: ["Acasă", "Servicii (o pagină pentru fiecare)", "Proiecte", "Cum lucrăm", "Zona de lucru", "Cerere de ofertă", "Contact"],
    plan: "growth",
    planWhy: "Planul Creștere adaugă SEO local pe servicii și localități și urmărirea cererilor de ofertă. Lunar adăugăm proiectele noi în portofoliu.",
    integrations: ["Google Business Profile", "Google Ads cu urmărirea cererilor de ofertă", "WhatsApp Business"],
    seo: ["Date structurate HomeAndConstructionBusiness și zona deservită", "Pagini pe servicii și localități", "Proiecte cu descrieri unice", "Imagini optimizate pentru încărcare rapidă"],
    faq: [
      ["Pot adăuga singur proiectele noi?", "Ne trimiți pozele și câteva rânduri din portal, iar noi publicăm proiectul în 48 de ore lucrătoare, în îmbunătățirea lunară."],
      ["Site-ul ajută la licitații cu firme mari?", "Un site cu proiecte, certificări și date de firmă clare e adesea primul lucru verificat înainte de invitația la ofertă."],
      ["Cât costă un site pentru o firmă de construcții?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus. Recomandăm Creștere, de 790 lei pe lună, pentru SEO local pe servicii."],
      ["Puteți face site în mai multe limbi?", "Da, cu opțiunea de limbă suplimentară, utilă pentru clienți din diaspora care renovează în țară."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "industry",
    slug: "site-firma-contabilitate",
    keyword: "site firmă de contabilitate",
    name: "firme de contabilitate",
    short: "Firme de contabilitate",
    metaTitle: "Site firmă de contabilitate și expertiză contabilă · LUNAR",
    desc: "Site pentru firmă de contabilitate sau expert contabil: servicii, pachete de prețuri, cerere de ofertă și resurse pentru clienți. Lansare în 10 zile.",
    h1: "Site pentru firmă de contabilitate.",
    h1Dim: "Clienți noi, mai puține întrebări repetate.",
    lede: "Antreprenorii își aleg contabilul după încredere, claritatea prețului și cât de repede răspunde. Site-ul tău poate răspunde la primele întrebări înainte de primul telefon.",
    pains: [
      "Fiecare client nou întreabă aceleași lucruri despre preț și documente.",
      "Prețurile depind de numărul de documente și e greu de explicat la telefon.",
      "Firma nu apare în Google pentru „contabilitate SRL” în orașul tău.",
      "Ai nevoie de clienți potriviți, nu de oricine.",
    ],
    features: [
      ["Pachete de servicii", "Contabilitate SRL, PFA, salarizare, înființare firmă, consultanță. Pachete cu prețuri de pornire și ce includ."],
      ["Calculator de ofertă", "Clientul alege tipul de firmă, numărul de documente și angajații și primește un preț orientativ."],
      ["Documente necesare", "Liste clare pentru preluarea contabilității și înființarea firmei."],
      ["Termene fiscale", "Pagină cu termenele importante, utilă clienților și bună pentru SEO."],
      ["Echipa și autorizări", "Experți contabili cu calitatea de membru în corpul profesional."],
      ["Cerere de ofertă", "Formular cu datele firmei, preluate automat după CUI."],
    ],
    pages: ["Acasă", "Servicii și pachete", "Calculator de ofertă", "Înființare firmă", "Resurse și termene", "Echipa", "Contact"],
    plan: "growth",
    planWhy: "Planul Creștere include SEO pe servicii, vizibilitate în răspunsurile AI pentru întrebări fiscale și urmărirea cererilor de ofertă. Calculatorul de ofertă intră în configurarea inițială.",
    integrations: ["Completare automată după CUI din datele ANAF", "Calendar pentru întâlniri", "Google Business Profile"],
    seo: ["Date structurate AccountingService", "Pagini pentru „contabilitate SRL”, „înființare firmă” și oraș", "Articole despre termene și obligații fiscale", "Pagini rapide și ușor de citit pe mobil"],
    faq: [
      ["Puteți face un calculator de preț pe site?", "Da. Stabilim împreună regulile de preț, iar clientul vede o estimare înainte să ceară oferta finală."],
      ["Cine scrie articolele despre termene fiscale?", "Pregătim structura și textul inițial, iar tu validezi conținutul înainte de publicare."],
      ["Cât costă un site pentru o firmă de contabilitate?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. Al tău după 12 plăți."],
      ["Formularul poate prelua datele firmei automat?", "Da, după CUI, din datele publice ANAF: denumire, adresă și număr de înregistrare."],
    ],
    updated: "2026-11-19",
  },
];

export const CITIES: City[] = [
  {
    kind: "city",
    slug: "creare-site-bucuresti",
    keyword: "creare site București",
    city: "București",
    inCity: "în București",
    metaTitle: "Creare site București pe abonament lunar · LUNAR",
    desc: "Creare site București pentru firme mici și mijlocii: design personalizat, SEO local pe sectoare și cartiere, lansare în 10 zile. Abonament lunar, fără taxă.",
    h1: "Creare site București.",
    h1Dim: "Pentru firme care vor clienți, nu doar prezență.",
    lede: "În București concurența pentru fiecare căutare locală e mare. Un site rapid, scris pentru clienții tăi și optimizat pe zona în care lucrezi face diferența.",
    market: [
      "Bucureștiul are cea mai mare concentrare de firme din țară, deci cele mai multe rezultate pentru aproape orice serviciu. Căutările se fac des cu sectorul sau cartierul: „dentist Sector 3”, „service auto Militari”. Site-ul trebuie să răspundă exact la aceste căutări.",
      "Pentru firmele de servicii, Google Business Profile și site-ul lucrează împreună. Profilul aduce apeluri din hartă, iar site-ul convinge clientul care compară trei variante înainte să sune.",
    ],
    areas: ["Toate cele 6 sectoare", "Pipera și Floreasca", "Militari și Drumul Taberei", "Titan și Berceni", "Voluntari și Otopeni", "Popești-Leordeni și Chiajna"],
    sectors: ["Clinici și cabinete medicale", "Servicii profesionale: avocatură, contabilitate, consultanță", "Restaurante și cafenele", "Construcții și amenajări interioare", "Saloane și centre de înfrumusețare"],
    localSeo: ["Pagini pentru zonele deservite, cu conținut real, nu doar numele schimbat", "Google Business Profile complet, cu categorii, servicii și poze", "Date structurate LocalBusiness cu adresă și program", "Recenzii Google afișate pe site", "Viteză mare pe mobil, pentru căutările din mers"],
    faq: [
      ["Cât costă crearea unui site în București?", "La LUNAR nu plătești o sumă mare la început: prima lună costă 4,99 lei pe planul Esențial, apoi abonamentul este 269 lei pe lună cu TVA inclus și include designul, dezvoltarea, hostingul și îmbunătățirile lunare. După 12 plăți, site-ul e al tău."],
      ["Ne întâlnim față în față?", "Lucrăm online: discuția de început pe Google Meet, brief-ul în portal, designul aprobat pe link. Așa livrăm în 10 zile lucrătoare."],
      ["Puteți optimiza site-ul pe un anumit sector?", "Da. Scriem conținut pentru zonele în care lucrezi efectiv și configurăm Google Business Profile pentru adresa ta."],
      ["Cât durează până apare firma în Google?", "Site-ul se indexează în câteva zile. Pozițiile bune pe căutări locale competitive se construiesc în câteva luni, cu conținut și recenzii."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "city",
    slug: "creare-site-cluj",
    keyword: "creare site Cluj",
    city: "Cluj-Napoca",
    inCity: "în Cluj-Napoca",
    metaTitle: "Creare site Cluj-Napoca pe abonament lunar · LUNAR",
    desc: "Creare site Cluj pentru firme locale: design personalizat, SEO pe cartiere și Florești, lansare în 10 zile. Abonament lunar, fără taxă de creare.",
    h1: "Creare site Cluj.",
    h1Dim: "Pentru un public care compară totul online.",
    lede: "Clujul are un public tânăr, obișnuit cu produse digitale bune. Un site lent sau greu de folosit pe telefon se vede imediat, iar clientul trece la următorul rezultat.",
    market: [
      "Comunitatea de tehnologie și universitățile fac din Cluj un oraș cu standarde digitale ridicate. Pentru firmele locale, asta înseamnă că site-ul e comparat cu cele mai bune experiențe online, nu doar cu concurența din oraș.",
      "Zona metropolitană crește în Florești, Baciu și Apahida. Mulți clienți caută servicii aproape de casă, așa că paginile pe zone deservite contează.",
    ],
    areas: ["Centru și Zorilor", "Mărăști și Gheorgheni", "Mănăștur și Grigorescu", "Bună Ziua și Borhanci", "Florești", "Baciu și Apahida"],
    sectors: ["Clinici medicale și stomatologice", "Firme de servicii pentru companii", "Restaurante și cafenele", "Construcții și dezvoltare rezidențială", "Educație și cursuri"],
    localSeo: ["Pagini pe zonele deservite, inclusiv Florești", "Google Business Profile complet", "Date structurate LocalBusiness", "Conținut în română și, opțional, în engleză sau maghiară", "Viteză mare pe mobil"],
    faq: [
      ["Cât costă crearea unui site în Cluj?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. Abonamentul include design, dezvoltare, hosting și îmbunătățiri lunare. După 12 plăți, site-ul e al tău."],
      ["Puteți face site și în maghiară sau engleză?", "Da, cu opțiunea de limbă suplimentară, de la 149 lei pe lună pentru fiecare limbă."],
      ["Lucrați cu firme din afara Clujului?", "Lucrăm online cu firme din toată țara. Discuțiile au loc pe Google Meet, iar restul în portalul de client."],
      ["Cât durează lansarea?", "10 zile lucrătoare de la brief. Dacă întârziem din vina noastră, luna următoare e gratuită."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "city",
    slug: "creare-site-iasi",
    keyword: "creare site Iași",
    city: "Iași",
    inCity: "în Iași",
    metaTitle: "Creare site Iași pe abonament lunar · LUNAR",
    desc: "Creare site Iași pentru firme locale: design personalizat, SEO local pe cartiere, lansare în 10 zile. Abonament lunar, al tău după 12 plăți.",
    h1: "Creare site Iași.",
    h1Dim: "Clienți din oraș și din toată Moldova.",
    lede: "Iașiul atrage pacienți, studenți și clienți din toată regiunea. Un site bine făcut te găsește și pe cei care caută din alt județ înainte să vină în oraș.",
    market: [
      "Ca centru universitar și medical al Moldovei, Iașiul primește clienți din județele vecine. Mulți te caută de la distanță, compară online și vin doar după ce au decis. Site-ul trebuie să răspundă complet: servicii, prețuri, cum ajung, cum fac o programare.",
      "Pentru clinici, cabinete și servicii profesionale, recenziile și paginile pe servicii sunt decisive pentru cei care fac drumul până în Iași.",
    ],
    areas: ["Centru și Copou", "Tătărași și Țicău", "Păcurari și Canta", "Nicolina și CUG", "Galata și Podu Roș", "Miroslava și Valea Lupului"],
    sectors: ["Clinici medicale și stomatologice", "Servicii profesionale", "Educație și meditații", "Restaurante și evenimente", "Construcții și amenajări"],
    localSeo: ["Pagini pentru serviciile căutate din Iași și județele vecine", "Google Business Profile cu indicații de acces", "Date structurate LocalBusiness", "Recenzii afișate pe site", "Viteză mare pe mobil"],
    faq: [
      ["Cât costă crearea unui site în Iași?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. Site-ul devine al tău după 12 plăți."],
      ["Puteți atrage clienți din alte județe?", "Da, prin pagini de servicii complete și SEO pe căutările din regiune. Rezultatele cresc în câteva luni."],
      ["Lucrați la distanță?", "Da. Discuțiile au loc pe Google Meet, iar brief-ul, aprobările și cererile în portalul de client."],
      ["Ce se întâmplă după lansare?", "Primești raport lunar și îmbunătățiri incluse în plan, ca site-ul să aducă mai multe cereri în timp."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "city",
    slug: "creare-site-timisoara",
    keyword: "creare site Timișoara",
    city: "Timișoara",
    inCity: "în Timișoara",
    metaTitle: "Creare site Timișoara pe abonament lunar · LUNAR",
    desc: "Creare site Timișoara pentru firme locale: design personalizat, SEO local, versiuni în engleză sau germană, lansare în 10 zile. Abonament lunar.",
    h1: "Creare site Timișoara.",
    h1Dim: "Pentru firme cu clienți din oraș și din afara țării.",
    lede: "Timișoara are o economie deschisă spre vest și mulți clienți care caută servicii și în alte limbi. Un site clar, rapid și multilingv te pune în fața lor.",
    market: [
      "Industria, firmele de tehnologie și apropierea de granița de vest aduc în Timișoara clienți care compară furnizori din mai multe țări. Pentru firmele B2B, un site în engleză sau germană e adesea condiția pentru a intra în discuție.",
      "Pentru serviciile locale, căutările pe cartiere și zona metropolitană, cu Dumbrăvița și Giroc, cresc odată cu noile cartiere rezidențiale.",
    ],
    areas: ["Centru și Cetate", "Fabric și Elisabetin", "Iosefin și Complexul Studențesc", "Circumvalațiunii și Dâmbovița", "Dumbrăvița și Giroc", "Ghiroda și Moșnița Nouă"],
    sectors: ["Firme B2B și producție", "Clinici medicale și stomatologice", "Servicii profesionale", "Restaurante și HoReCa", "Construcții și dezvoltare rezidențială"],
    localSeo: ["Versiuni în engleză sau germană, cu SEO pe fiecare limbă", "Pagini pe zonele deservite din zona metropolitană", "Google Business Profile complet", "Date structurate LocalBusiness", "Viteză mare pe mobil"],
    faq: [
      ["Cât costă crearea unui site în Timișoara?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. Limbile suplimentare pornesc de la 149 lei pe lună pentru fiecare limbă."],
      ["Traduceți voi textele în engleză sau germană?", "Pregătim versiunile și adaptăm SEO-ul pe fiecare limbă. Pentru texte juridice sau tehnice recomandăm o verificare făcută de tine sau de un traducător."],
      ["Lucrați și cu firme B2B?", "Da. Pentru firmele B2B recomandăm planul Partener, cu landing pages pentru campanii și optimizarea conversiilor."],
      ["Cât durează lansarea?", "10 zile lucrătoare de la brief. Dacă întârziem din vina noastră, luna următoare e gratuită."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "city",
    slug: "creare-site-constanta",
    keyword: "creare site Constanța",
    city: "Constanța",
    inCity: "în Constanța",
    metaTitle: "Creare site Constanța pe abonament lunar · LUNAR",
    desc: "Creare site Constanța pentru firme din turism, HoReCa și servicii: rezervări, mai multe limbi, SEO local. Lansare în 10 zile, abonament lunar.",
    h1: "Creare site Constanța.",
    h1Dim: "Pregătit pentru sezon înainte să înceapă.",
    lede: "La malul mării, multe decizii se iau cu săptămâni înainte de sezon, de pe telefon. Un site cu rezervări directe și informații la zi te scoate din dependența de platformele cu comision.",
    market: [
      "Turismul face ca o parte mare din clienți să caute de la distanță, adesea din alte orașe sau din străinătate. Site-ul trebuie să răspundă la întrebările lor: disponibilitate, prețuri, cum ajung, ce e inclus.",
      "Pentru firmele care lucrează tot anul, cum sunt clinicile, service-urile și firmele de logistică din zona portului, SEO-ul local aduce clienții din oraș și din localitățile din jur.",
    ],
    areas: ["Centru și Peninsula", "Tomis Nord și Tomis III", "Faleză Nord și Inel", "Mamaia și Năvodari", "Ovidiu și Lumina", "Eforie și Techirghiol"],
    sectors: ["Cazare și turism", "Restaurante și beach bar-uri", "Clinici și servicii medicale", "Logistică și servicii pentru port", "Construcții și amenajări"],
    localSeo: ["Rezervări directe pe site, fără comision", "Pagini în engleză pentru turiști", "Google Business Profile cu program sezonier", "Date structurate LodgingBusiness sau Restaurant", "Viteză mare pe mobil"],
    faq: [
      ["Cât costă crearea unui site în Constanța?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. După 12 plăți, site-ul e al tău."],
      ["Putem actualiza prețurile pe sezon?", "Da. Actualizările de sezon intră în îmbunătățirile lunare și le livrăm în 48 de ore lucrătoare."],
      ["Puteți integra rezervările?", "Da, cu formular de rezervare sau cu sistemul de rezervări pe care îl folosești, dacă are integrare."],
      ["Când ar trebui să lansez site-ul înainte de sezon?", "Ideal cu două sau trei luni înainte, ca Google să indexeze paginile și să ai timp pentru ajustări."],
    ],
    updated: "2026-11-19",
  },
  {
    kind: "city",
    slug: "creare-site-brasov",
    keyword: "creare site Brașov",
    city: "Brașov",
    inCity: "în Brașov",
    metaTitle: "Creare site Brașov pe abonament lunar · LUNAR",
    desc: "Creare site Brașov pentru firme locale, turism și servicii: design personalizat, SEO local, rezervări și mai multe limbi. Lansare în 10 zile.",
    h1: "Creare site Brașov.",
    h1Dim: "Pentru localnici și pentru turiști.",
    lede: "Brașovul trăiește din două tipuri de clienți: localnicii, care caută servicii aproape de casă, și turiștii, care decid de pe telefon unde mănâncă, dorm și ce vizitează.",
    market: [
      "Turismul de munte și de oraș aduce vizitatori tot anul, cu vârfuri iarna și vara. Pentru cazare, restaurante și activități, un site rapid, în mai multe limbi, cu rezervări directe e un avantaj față de cei care depind doar de platforme.",
      "Zona metropolitană crește în Ghimbav, Sânpetru și Cristian, iar firmele de servicii locale câștigă din pagini dedicate zonelor deservite.",
    ],
    areas: ["Centrul Vechi și Schei", "Tractorul și Coresi", "Răcădău și Astra", "Noua și Dârste", "Poiana Brașov", "Ghimbav, Sânpetru și Cristian"],
    sectors: ["Cazare și turism", "Restaurante și cafenele", "Clinici și servicii medicale", "Construcții și amenajări", "Industrie și firme B2B"],
    localSeo: ["Pagini în engleză pentru turiști", "Rezervări directe pe site", "Google Business Profile complet", "Date structurate LocalBusiness, Restaurant sau LodgingBusiness", "Viteză mare pe mobil"],
    faq: [
      ["Cât costă crearea unui site în Brașov?", "Începi cu 4,99 lei în prima lună pe planul Esențial, apoi 269 lei pe lună cu TVA inclus, fără taxă de creare. Site-ul devine al tău după 12 plăți."],
      ["Puteți face site în mai multe limbi pentru turiști?", "Da, cu opțiunea de limbă suplimentară, de la 149 lei pe lună pentru fiecare limbă."],
      ["Lucrați la distanță?", "Da. Discuțiile au loc pe Google Meet, iar aprobările și cererile în portalul de client."],
      ["Ce primesc lunar după lansare?", "Hosting, mentenanță, backup zilnic, monitorizare, raport lunar și numărul de îmbunătățiri din planul ales."],
    ],
    updated: "2026-11-19",
  },
];

export const LANDINGS = [...INDUSTRIES, ...CITIES];
export const landingBySlug = (slug: string) => LANDINGS.find((l) => l.slug === slug);
