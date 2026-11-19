import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { PLANS } from "@/lib/plans";
import { faqLd } from "@/lib/seo";

const DESC = "Garanțiile LUNAR: lansare în 10 zile lucrătoare sau luna următoare gratuită, fără avans, preț fix cu TVA inclus și site-ul al tău după 12 plăți.";

export const metadata: Metadata = {
  title: { absolute: "Garanții website: lansare la timp, fără avans · LUNAR" },
  description: DESC,
  alternates: { canonical: "/garantii" },
  openGraph: { title: "Garanțiile LUNAR", description: DESC, url: "/garantii", type: "website" },
};

const G: { t: string; d: string; how: string[]; note?: string }[] = [
  { t: "Lansare în 10 zile lucrătoare", d: "Website-ul tău e online în cel mult 10 zile lucrătoare de la brief.", how: ["Ceasul pornește după confirmarea primei plăți și trimiterea brief-ului.", "Zilele în care așteptăm materiale sau aprobări de la tine nu se numără. Le vezi în portal.", "Dacă depășim termenul din vina noastră, luna următoare de abonament e gratuită, automat."], note: "Nu returnăm bani. Compensăm cu o lună fără plată." },
  { t: "Fără avans, fără taxă de creare", d: "Nu plătești mii de lei la început. Prima lună pe planul Esențial costă 4,99 lei pentru clienții noi.", how: ["Designul, textele și dezvoltarea sunt incluse în abonament.", "Codul GOLUNAR se aplică automat la comandă.", `Din luna a doua plătești prețul planului, de la ${PLANS.essential.ron} lei pe lună.`] },
  { t: "Preț fix, cu TVA inclus", d: "Un singur preț lunar. Fără costuri ascunse pentru hosting, SSL, backup sau mentenanță.", how: ["Prețul afișat este prețul final, cu TVA inclus.", "Îmbunătățirile incluse în plan nu se plătesc separat.", "Primești factură fiscală în SPV pentru fiecare plată."] },
  { t: "Îmbunătățiri lunare, cu răspuns în 48 de ore", d: "Site-ul nu e predat și uitat. Îl facem mai bun în fiecare lună.", how: ["Ceri modificări din portalul de client, dintr-un click.", "Răspundem în maximum 48 de ore lucrătoare la orice cerere.", "Numărul de îmbunătățiri incluse depinde de plan: 1, 2 sau 4 pe lună."] },
  { t: "Site monitorizat permanent", d: "Verificăm site-ul la fiecare 10 minute și facem backup zilnic.", how: ["Dacă site-ul nu răspunde, aflăm înaintea ta.", "Actualizările de securitate sunt incluse.", "Primești în fiecare lună un raport cu vizitatori, cereri și disponibilitate."] },
  { t: "Al tău după 12 plăți", d: "Domeniul e pe firma ta din prima zi. După 12 plăți, primești și website-ul.", how: ["Semnăm procesul-verbal de transfer după a 12-a plată.", "La cerere, îți predăm codul-sursă și fișierele în cel mult 15 zile lucrătoare.", "Poți continua abonamentul pentru hosting și îmbunătățiri sau poți pleca."] },
  { t: "Perioadă minimă scurtă", d: "Te angajezi pentru puțin timp. Apoi anulezi oricând.", how: [`Esențial: ${PLANS.essential.minMonths} luni. Creștere: ${PLANS.growth.minMonths} luni. Partener: ${PLANS.partner.minMonths === 1 ? "o lună" : `${PLANS.partner.minMonths} luni`}.`, "După perioada minimă, anulezi din portal, fără penalități.", "Abonamentul se oprește la finalul lunii deja plătite."] },
];

const FAQ: [string, string][] = [
  ["Ce primesc dacă lansarea întârzie?", "Dacă depășim 10 zile lucrătoare din vina noastră, luna următoare de abonament e gratuită. Nu returnăm bani, compensăm cu o lună fără plată."],
  ["Garanțiile sunt scrise în contract?", "Da. Le găsești în contractul-cadru pe care îl accepți la comandă și în portalul de client."],
  ["Ce înseamnă „din vina noastră”?", "Orice întârziere care nu ține de tine. Dacă așteptăm materiale, răspunsuri sau aprobări de la tine, zilele acelea nu se numără, iar în portal vezi exact când ceasul e oprit."],
];

export default function GuaranteesPage() {
  return (
    <PageShell
      crumbs={[["/garantii", "Garanții"]]}
      eyebrow="Garanții"
      title={<>Riscul e la noi. <span className="dim">Nu la tine.</span></>}
      lede="Promisiunile LUNAR, explicate pe larg: ce garantăm, cum funcționează fiecare garanție și ce primești dacă nu ne ținem de cuvânt."
      meta={<><span className="pill acc"><span className="d" />Începi cu 4,99 lei</span><span className="pill">Lansare în 10 zile sau luna următoare gratuită</span></>}
      jsonLd={[faqLd(FAQ)]}
    >
      <div className="wide-block">
        <div className="guar-grid">
          {G.map((g, i) => (
            <div className="card guar-card" key={g.t}>
              <span className="mono">0{i + 1}</span>
              <h3>{g.t}</h3>
              <p>{g.d}</p>
              <ul className="co-feat">{g.how.map((h) => <li key={h}>{h}</li>)}</ul>
              {g.note && <p className="guar-note">{g.note}</p>}
            </div>
          ))}
        </div>
      </div>
      <article className="article">
        <h2>De ce oferim aceste garanții</h2>
        <p>Cei mai mulți antreprenori au o poveste despre un site care a costat prea mult, a durat prea mult sau a rămas neactualizat. Garanțiile LUNAR mută riscul de la tine la noi: plătești puțin la început, știi exact când ești online și primești îmbunătățiri în fiecare lună.</p>
        <p>Vrei să vezi cum stăm față de alte variante? Citește <Link className="inl" href="/lunar-vs-agentie-vs-ai">comparația LUNAR, agenție sau AI</Link> sau <Link className="inl" href="/cum-lucram">procesul nostru, zi cu zi</Link>.</p>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </PageShell>
  );
}
