import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { PLANS } from "@/lib/plans";

const DESC = "Procesul de creare a unui website la LUNAR, zi cu zi: brief, design, dezvoltare și lansare în 10 zile lucrătoare, apoi îmbunătățiri lunare până devine al tău.";

export const metadata: Metadata = {
  title: { absolute: "Procesul de creare a unui website, zi cu zi · LUNAR" },
  description: DESC,
  alternates: { canonical: "/cum-lucram" },
  openGraph: { title: "Cum lucrăm: procesul de creare a unui website, zi cu zi", description: DESC, url: "/cum-lucram", type: "article" },
};

type Step = { when: string; title: string; you: string; we: string; out: string };

const LAUNCH: Step[] = [
  { when: "Ziua 0", title: "Comanda", you: "Alegi planul, completezi datele firmei și plătești prima lună prin transfer bancar.", we: "Creăm contul tău în portal, contractul și calendarul celor 12 plăți. Domeniul se înregistrează pe firma ta.", out: "Acces în portal și contract semnat electronic." },
  { when: "Ziua 1", title: "Brief-ul", you: "Completezi brief-ul de 5 minute: ce vinzi, cui, ce te diferențiază, ce site-uri îți plac. Încarci logo și poze, dacă ai.", we: "Citim brief-ul în aceeași zi și te sunăm 20 de minute dacă lipsește ceva. Pornește ceasul de 10 zile lucrătoare.", out: "Structura paginilor și lista de texte." },
  { when: "Ziua 2–3", title: "Texte și structură", you: "Nimic, dacă nu vrei. Poți răspunde la întrebări scurte pe email.", we: "Scriem textele pentru clienții tăi, nu pentru noi: ce problemă rezolvi, de ce tu, ce urmează după click. Alegem cuvintele cheie.", out: "Textele paginilor, gata de aprobat." },
  { when: "Ziua 4", title: "Designul", you: "Primești designul paginii principale pe telefon și desktop. Ai o rundă de feedback inclusă.", we: "Design personalizat pe brandul tău, gândit întâi pentru mobil, cu un singur scop pe pagină: cererea de ofertă.", out: "Design aprobat." },
  { when: "Ziua 5–8", title: "Dezvoltarea", you: "Urmărești progresul în portal. Nu trebuie să faci nimic.", we: "Construim site-ul rapid, pe infrastructură în UE. Configurăm formulare, SEO tehnic, date structurate, Google Analytics, Search Console și emailul pe domeniu.", out: "Site complet pe un link de previzualizare." },
  { when: "Ziua 9", title: "Verificarea", you: "Te uiți pe link și ne spui ce mai vrei schimbat.", we: "Testăm pe telefoane reale, verificăm viteza, formularele, linkurile și redirecționările de la site-ul vechi.", out: "Listă de verificare 100% bifată." },
  { when: "Ziua 10", title: "Lansarea", you: "Dai OK-ul final.", we: "Mutăm domeniul pe site-ul nou, activăm SSL-ul și backup-ul zilnic și trimitem harta site-ului la Google.", out: "Site live. Dacă întârziem din vina noastră, luna următoare e gratuită." },
];

const MONTHS: Step[] = [
  { when: "Luna 1", title: "Primul raport", you: "Primești pe email, în ziua 3 a lunii, raportul: vizitatori, cereri din formular, poziții în Google.", we: "Monitorizăm site-ul la fiecare 10 minute, facem backup zilnic și actualizăm tot ce ține de securitate.", out: "Raport lunar și site stabil." },
  { when: "Lunile 2–11", title: "Îmbunătățiri lunare", you: "Ceri din portal îmbunătățirile incluse în plan: o pagină nouă, o secțiune, o ofertă de sezon, o integrare.", we: "Răspundem în 48 de ore lucrătoare și livrăm. La planurile Creștere și Partener propunem noi îmbunătățirile, pe baza datelor.", out: "Site mai bun în fiecare lună, nu doar întreținut." },
  { when: "Luna 12", title: "Site-ul devine al tău", you: "Plătești a 12-a rată.", we: "Semnăm procesul-verbal de transfer. La cerere, îți predăm codul-sursă și fișierele în cel mult 15 zile lucrătoare.", out: "Proprietate deplină. Poți continua abonamentul pentru hosting și îmbunătățiri sau poți pleca." },
];

const FAQ: [string, string][] = [
  ["Cât durează crearea unui website?", "La LUNAR, 10 zile lucrătoare de la brief până la lansare. Zilele în care așteptăm materiale de la tine nu se numără."],
  ["Ce trebuie să pregătesc pentru un site nou?", "Doar brief-ul de 5 minute. Logo-ul, pozele și textele existente ajută, dar nu sunt obligatorii: scriem noi textele."],
  ["Câte runde de modificări am la design?", "O rundă de feedback inclusă la design înainte de dezvoltare. După lansare, modificările intră în îmbunătățirile lunare din plan."],
];

function Track({ steps }: { steps: Step[] }) {
  return (
    <ol className="how-track">
      {steps.map((s) => (
        <li key={s.when}>
          <div className="how-when">{s.when}</div>
          <div className="how-card">
            <h3>{s.title}</h3>
            <div className="how-cols">
              <div><span>Tu</span><p>{s.you}</p></div>
              <div><span>Noi</span><p>{s.we}</p></div>
            </div>
            <div className="how-out"><b>Rezultat</b>{s.out}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowWeWork() {
  return (
    <PageShell
      crumbs={[["/cum-lucram", "Cum lucrăm"]]}
      eyebrow="Proces"
      title={<>Cum lucrăm. <span className="dim">Zi cu zi, de la brief la proprietate.</span></>}
      lede="Procesul de creare a unui website la LUNAR, pas cu pas: ce faci tu, ce facem noi și ce primești la fiecare etapă. Fără surprize."
      jsonLd={[
        {
          "@context": "https://schema.org", "@type": "HowTo", name: "Procesul de creare a unui website la LUNAR", description: DESC, inLanguage: "ro-RO",
          totalTime: "P14D", estimatedCost: { "@type": "MonetaryAmount", currency: "RON", value: PLANS.essential.ron },
          step: [...LAUNCH, ...MONTHS].map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: `${s.when}: ${s.title}`, text: `${s.we} ${s.out}`})),
        },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ]}
    >
      <article className="article">
        <p>Mai jos e drumul complet al unui client, de la comandă până în ziua în care site-ul devine al lui. Etapele sunt aceleași pentru orice plan. Diferă doar câte îmbunătățiri primești lunar.</p>
        <h2>Lansarea: 10 zile lucrătoare</h2>
      </article>
      <div className="wide-block"><Track steps={LAUNCH} /></div>
      <article className="article">
        <h2>După lansare: 12 luni până devine al tău</h2>
        <p>Aici e diferența față de o agenție clasică. Site-ul nu e predat și uitat: îl îngrijim și îl îmbunătățim în fiecare lună. Vezi starea serviciilor live pe <Link className="inl" href="/status">pagina de status</Link>.</p>
      </article>
      <div className="wide-block"><Track steps={MONTHS} /></div>
      <article className="article">
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
        <p>Vrei să știi cum arată site-ul tău acum? Fă un <Link className="inl" href="/audit">audit SEO gratuit</Link> în 60 de secunde.</p>
      </article>
    </PageShell>
  );
}
