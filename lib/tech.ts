export type Tech = { n: string; d: string };
export type TechGroup = { id: string; t: string; lede: string; items: Tech[] };

export const TECH_CORE: Tech[] = [
  { n: "Next.js", d: "Framework-ul pe care construim fiecare site. Pagini generate dinainte, încărcare aproape instantă și SEO tehnic corect din prima zi." },
  { n: "Vercel", d: "Platforma de găzduire. Rețea globală de servere, HTTPS automat, lansări fără întreruperi și revenire la versiunea anterioară dintr-un click." },
  { n: "Supabase", d: "Baza de date și autentificarea. PostgreSQL cu reguli de acces pe fiecare rând și backup zilnic." },
];

export const TECH: TechGroup[] = [
  { id: "frontend", t: "Interfață", lede: "Ce vede clientul tău: rapid, accesibil, perfect pe telefon.", items: [
    { n: "React", d: "Biblioteca pentru componente interactive: formulare, filtre, calculatoare, galerii." },
    { n: "TypeScript", d: "Cod verificat înainte de lansare. Mai puține erori ajung pe site." },
    { n: "Tailwind CSS", d: "Stiluri consecvente și fișiere CSS mici, pentru încărcare rapidă." },
    { n: "Framer Motion", d: "Animații fine care ghidează privirea, fără să încetinească pagina." },
    { n: "Radix UI", d: "Componente accesibile: meniuri, ferestre și taburi care merg și de la tastatură." },
    { n: "Lucide", d: "Set unitar de iconițe vectoriale, clare la orice dimensiune." },
    { n: "Fonturi variabile", d: "Un singur fișier de font pentru toate grosimile. Text care apare imediat." },
    { n: "WebP și AVIF", d: "Formate moderne de imagine, de până la 3 ori mai mici decât JPG." },
  ]},
  { id: "backend", t: "Date și logică", lede: "Ce se întâmplă în spate: date sigure, procese automate.", items: [
    { n: "PostgreSQL", d: "Baza de date relațională pe care rulează Supabase. Stabilă, matură, standard în industrie." },
    { n: "Node.js", d: "Mediul în care rulează logica de pe server: formulare, integrări, rapoarte." },
    { n: "Funcții serverless", d: "Codul rulează doar când e nevoie. Costuri mici și scalare automată la trafic mare." },
    { n: "Edge Middleware", d: "Redirecționări, limbă și protecție aplicate înainte ca pagina să fie servită." },
    { n: "Supabase Auth", d: "Conturi de client cu link magic pe email, fără parole de reținut." },
    { n: "Supabase Storage", d: "Fișiere și imagini încărcate în siguranță, cu acces controlat." },
    { n: "pg_cron", d: "Sarcini programate în baza de date: rapoarte lunare, verificări, curățenie." },
    { n: "Zod", d: "Validarea datelor primite din formulare, înainte să ajungă în baza de date." },
  ]},
  { id: "comunicare", t: "Email și comunicare", lede: "Mesaje care ajung în inbox, nu în spam.", items: [
    { n: "Resend", d: "Trimiterea emailurilor tranzacționale: confirmări, notificări, rapoarte." },
    { n: "React Email", d: "Șabloane de email construite ca pagini, afișate corect în Gmail, Outlook și Apple Mail." },
    { n: "SPF, DKIM și DMARC", d: "Autentificarea domeniului tău, ca emailurile să fie de încredere pentru furnizori." },
    { n: "WhatsApp Business", d: "Buton de contact direct și mesaje rapide de pe telefonul clientului." },
  ]},
  { id: "seo", t: "SEO și vizibilitate", lede: "Ca să te găsească Google și asistenții AI.", items: [
    { n: "Schema.org", d: "Date structurate pentru firmă, servicii și întrebări frecvente. Rezultate mai bogate în Google." },
    { n: "Sitemap XML", d: "Harta site-ului, generată automat la fiecare publicare." },
    { n: "llms.txt", d: "Rezumat al site-ului pentru ChatGPT, Claude și Perplexity." },
    { n: "Open Graph", d: "Imagini și titluri corecte când linkul e distribuit pe Facebook, LinkedIn sau WhatsApp." },
    { n: "Google Search Console", d: "Indexare, cuvinte-cheie și erori raportate direct de Google." },
    { n: "PageSpeed Insights", d: "Măsurăm viteza reală și Core Web Vitals la fiecare lansare." },
  ]},
  { id: "masurare", t: "Măsurare și marketing", lede: "Știi de unde vin clienții și ce aduce rezultate.", items: [
    { n: "Google Analytics 4", d: "Vizitatori, surse de trafic și conversii, configurate corect." },
    { n: "Google Tag Manager", d: "Coduri de urmărire gestionate dintr-un singur loc, fără să încetinească site-ul." },
    { n: "Google Ads", d: "Conversii măsurate pentru campanii: formulare, apeluri, WhatsApp." },
    { n: "Meta Pixel", d: "Măsurarea campaniilor din Facebook și Instagram." },
    { n: "Vercel Analytics", d: "Statistici de trafic fără cookie-uri, respectând GDPR." },
  ]},
  { id: "siguranta", t: "Siguranță și operare", lede: "Site-ul stă online, iar datele rămân protejate.", items: [
    { n: "SSL / HTTPS", d: "Certificat de securitate inclus și reînnoit automat." },
    { n: "Vercel Firewall", d: "Protecție automată împotriva atacurilor și a traficului abuziv." },
    { n: "Monitorizare uptime", d: "Verificăm site-ul la fiecare 10 minute și intervenim înainte să observi." },
    { n: "Backup zilnic", d: "Copii de siguranță zilnice ale datelor, restaurabile oricând." },
    { n: "GitHub", d: "Istoric complet al codului. Orice modificare poate fi verificată și anulată." },
    { n: "Stripe", d: "Plăți cu cardul și abonamente, când magazinul sau serviciul o cer." },
  ]},
];

export const TECH_COUNT = TECH_CORE.length + TECH.reduce((s, g) => s + g.items.length, 0);
