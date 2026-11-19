import type { Metadata } from "next";
import ResourceShell from "@/components/site/ResourceShell";
import MigrationChecklist, { type Phase } from "@/components/site/MigrationChecklist";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("schimbi-furnizorul-web-fara-sa-pierzi-trafic")!;
export const metadata: Metadata = {
  title: r.metaTitle,
  description: r.metaDesc,
  alternates: { canonical: `/resurse/${r.slug}` },
  openGraph: { title: r.title, description: r.metaDesc, type: "article", url: `/resurse/${r.slug}`, publishedTime: r.updated, modifiedTime: r.updated },
};

const PHASES: Phase[] = [
  {
    title: "1. Înainte de orice schimbare",
    steps: [
      { id: "acc", t: "Obține accesurile la domeniu și DNS", d: "Află la ce registrar e înregistrat domeniul, pe ce firmă și cine are contul. Fără acces la DNS nu poți muta nimic." },
      { id: "mail", t: "Notează setările de email (MX, SPF, DKIM)", d: "Copiază toate înregistrările DNS existente. Dacă emailul e pe același hosting cu site-ul, mută-l separat, înainte de site." },
      { id: "urls", t: "Exportă lista completă de URL-uri", d: "Din sitemap, din Google Search Console (Pagini) și dintr-un crawler. Aceasta e baza redirecționărilor." },
      { id: "top", t: "Identifică paginile care aduc trafic și clienți", d: "Search Console → Performanță, ultimele 12 luni. Paginile din top 20 trebuie păstrate sau redirecționate 1:1." },
      { id: "bk", t: "Fă backup complet", d: "Fișiere, bază de date, imagini, formulare și lista de abonați. Păstrează backup-ul pe un mediu care nu depinde de vechiul furnizor." },
      { id: "track", t: "Inventariază tracking-ul", d: "Google Analytics, Google Ads, Meta Pixel, Tag Manager, chat-uri, cookie banner. Notează ID-urile ca să le reinstalezi identic." },
    ],
  },
  {
    title: "2. Pregătirea noului site",
    steps: [
      { id: "map", t: "Construiește harta de redirecționări 301", d: "Fiecare URL vechi către cel mai relevant URL nou, unu la unu. Nu redirecționa totul către prima pagină." },
      { id: "meta", t: "Păstrează titlurile și descrierile care performează", d: "Paginile cu poziții bune în Google își păstrează titlul, meta description și structura de headinguri." },
      { id: "staging", t: "Testează pe un mediu de test, blocat la indexare", d: "Site-ul nou se verifică pe o adresă de test, ascunsă de Google, pe mobil și desktop, cu toate formularele." },
      { id: "forms", t: "Verifică formularele și emailurile automate", d: "Trimite câte o cerere de test din fiecare formular și confirmă că ajunge la adresa corectă." },
      { id: "ttl", t: "Scade TTL-ul DNS cu 24–48 de ore înainte", d: "Un TTL de 300 de secunde face ca schimbarea să se propage în câteva minute, nu în ore." },
    ],
  },
  {
    title: "3. Ziua lansării",
    steps: [
      { id: "dns", t: "Schimbă DNS-ul către noul hosting", d: "Modifică doar înregistrările pentru site (A / CNAME). Lasă neatinse înregistrările de email." },
      { id: "ssl", t: "Confirmă certificatul SSL și varianta unică de domeniu", d: "Toate variantele (http, www, fără www) redirecționează către aceeași adresă https." },
      { id: "noindex", t: "Elimină blocarea indexării", d: "Cea mai frecventă greșeală: site-ul nou rămâne cu noindex sau robots.txt blocat din etapa de test." },
      { id: "redir", t: "Testează redirecționările", d: "Verifică un eșantion din harta 301, cu prioritate pe paginile din top 20." },
      { id: "sitemap", t: "Trimite noul sitemap în Search Console", d: "Dacă se schimbă și domeniul, folosește și instrumentul Schimbarea adresei din Search Console." },
      { id: "conv", t: "Verifică tracking-ul conversiilor", d: "Fă o conversie de test și confirm-o în Google Analytics și Google Ads în aceeași zi." },
    ],
  },
  {
    title: "4. Primele 8 săptămâni",
    steps: [
      { id: "404", t: "Monitorizează erorile 404", d: "Săptămânal, în Search Console. Fiecare 404 cu trafic primește o redirecționare." },
      { id: "rank", t: "Urmărește pozițiile și traficul organic", d: "O scădere ușoară în primele 2–4 săptămâni e normală. O scădere mare indică redirecționări sau pagini lipsă." },
      { id: "keep", t: "Păstrează redirecționările cel puțin un an", d: "Google recomandă menținerea redirecționărilor 301 minimum un an după migrare." },
      { id: "old", t: "Închide vechiul hosting abia după 30 de zile", d: "Până atunci ai o cale de întoarcere și acces la fișierele vechi." },
    ],
  },
];

export default function Page() {
  return (
    <ResourceShell r={r}>
      <article className="article">
        <p>Majoritatea pierderilor de trafic după schimbarea site-ului vin din trei greșeli: pagini șterse fără redirecționare, site-ul nou blocat la indexare și emailul oprit din greșeală la mutarea DNS-ului. Toate se pot evita cu o listă de verificare.</p>
        <p>Bifează pașii pe parcurs. Progresul rămâne salvat în acest browser.</p>
        <MigrationChecklist phases={PHASES} />
        <div className="callout" style={{ marginTop: 40 }}><b>Treci la LUNAR?</b><p>Spune-ne în discuția gratuită ce site ai acum și îți explicăm exact ce presupune mutarea în cazul tău.</p></div>
      </article>
    </ResourceShell>
  );
}
