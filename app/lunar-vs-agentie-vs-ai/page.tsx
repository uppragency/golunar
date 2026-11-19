import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/site/PageShell";
import { COMP } from "@/lib/compare";
import { PLANS } from "@/lib/plans";
import { faqLd } from "@/lib/seo";

const DESC = "Agenție web, site făcut cu AI sau LUNAR? Comparăm costul, timpul, designul, modificările, SEO-ul și proprietatea, ca să alegi cum îți faci website-ul.";

export const metadata: Metadata = {
  title: { absolute: "Agenție web sau site făcut cu AI? Comparație · LUNAR" },
  description: DESC,
  alternates: { canonical: "/lunar-vs-agentie-vs-ai" },
  openGraph: { title: "LUNAR, agenție web sau site făcut cu AI", description: DESC, url: "/lunar-vs-agentie-vs-ai", type: "article" },
};

const E = PLANS.essential;

const DETAIL: { h: string; lunar: string; agency: string; ai: string }[] = [
  { h: "Costul real, nu doar prețul de început", lunar: `Începi cu 6 lei în prima lună, apoi ${E.ron} lei pe lună, cu tot inclus: design, texte, hosting, mentenanță și îmbunătățiri. Știi din prima zi cât plătești în fiecare lună.`, agency: "Plătești de obicei o sumă mare la început, de multe ori în avans. Hostingul, mentenanța și modificările ulterioare vin separat, la ofertă nouă.", ai: "Abonamentul platformei pare mic, dar adaugi domeniu, șablon premium, aplicații și, mai ales, orele tale de lucru. Timpul tău are un cost." },
  { h: "Cât durează până ești online", lunar: "10 zile lucrătoare de la brief, garantat în contract. Dacă întârziem din vina noastră, luna următoare e gratuită.", agency: "Proiectele trec prin ofertare, contract, avans și mai multe runde de feedback. Durata se întinde de la câteva săptămâni la câteva luni.", ai: "Poți avea o pagină în câteva ore, dar un site complet, cu texte bune și imagini potrivite, cere zile de lucru din partea ta." },
  { h: "Design și texte", lunar: "Design personalizat pe brandul tău și texte scrise pentru clienții tăi, cu un singur scop pe pagină: cererea de ofertă sau programarea.", agency: "Designul e personalizat. Textele sunt adesea responsabilitatea ta sau un serviciu plătit separat.", ai: "Pornești de la un șablon pe care îl folosesc mii de alte site-uri. Textele generate sunt generice și trebuie rescrise ca să sune a tine." },
  { h: "Ce se întâmplă după lansare", lunar: "Site-ul se îmbunătățește lunar: pagini noi, oferte, integrări, din portalul de client, cu răspuns în 48 de ore. Primești raport lunar.", agency: "Site-ul e predat. Fiecare modificare devine un mic proiect nou, cu ofertă și termen.", ai: "Toate modificările le faci singur. Dacă ceva nu merge, cauți soluția în documentație sau scrii la suportul platformei." },
  { h: "Tehnic: viteză, SEO, securitate", lunar: "Viteză mare pe mobil, SEO tehnic, date structurate, SSL, backup zilnic și monitorizare la 10 minute, configurate din prima zi.", agency: "Depinde de agenție și de pachet. Mentenanța și monitorizarea sunt de obicei contracte separate.", ai: "Platforma acoperă baza. Optimizarea vitezei și SEO-ul avansat rămân limitate de șablon și de ce îți permite editorul." },
  { h: "Al cui e site-ul", lunar: "Domeniul e pe firma ta din prima zi. După 12 plăți, site-ul devine al tău, cu codul-sursă la cerere.", agency: "Devine al tău după plata integrală. Verifică în contract cine deține codul, domeniul și conturile.", ai: "Site-ul trăiește pe platformă. Dacă pleci, de cele mai multe ori o iei de la capăt." },
];

const FAQ: [string, string][] = [
  ["Ce este mai ieftin: agenție, AI sau abonament?", `Pe hârtie, un builder cu AI pare cel mai ieftin. Dacă pui la socoteală timpul tău, modificările și mentenanța, abonamentul LUNAR rămâne de obicei cel mai avantajos: începi cu 6 lei, apoi ${E.ron} lei pe lună, cu tot inclus.`],
  ["Pot face singur site-ul cu AI și apoi să trec la LUNAR?", "Da. Preluăm conținutul existent și îl refacem pe designul nostru, cu redirecționări ca să nu pierzi pozițiile din Google."],
  ["Am deja o agenție. Pot trece la LUNAR?", "Da. Te ajutăm cu mutarea domeniului și a conținutului. Vezi ghidul pentru schimbarea furnizorului fără pierderi de trafic."],
];

export default function ComparePage() {
  return (
    <PageShell
      crumbs={[["/lunar-vs-agentie-vs-ai", "LUNAR, agenție sau AI"]]}
      eyebrow="Comparație"
      title={<>LUNAR, agenție sau AI. <span className="dim">Ce alegi pentru website-ul tău.</span></>}
      lede="Sunt trei drumuri pentru un website de firmă. Le-am pus alături pe criteriile care contează după lansare, nu doar în prima zi."
      meta={<><span className="pill acc"><span className="d" />Începi cu 6 lei</span><span className="pill">Lansare în 10 zile</span><span className="pill">Al tău după 12 plăți</span></>}
      jsonLd={[faqLd(FAQ)]}
    >
      <div className="wide-block">
        <div className="cmp-scroll">
          <table className="cmp">
            <thead><tr><th scope="col"><span className="sr-only">Criteriu</span></th><th scope="col" className="cmp-l">LUNAR</th><th scope="col">Agenție clasică</th><th scope="col">Site făcut cu AI</th></tr></thead>
            <tbody>
              {COMP.map((r) => (
                <tr key={r.k}><th scope="row">{r.k}</th><td className="cmp-l"><i aria-hidden="true">✓</i>{r.lunar.t}</td><td>{r.agency.t}</td><td>{r.ai.t}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <article className="article">
        {DETAIL.map((d) => (
          <section key={d.h}>
            <h2>{d.h}</h2>
            <div className="cmp-detail">
              <div className="lunar"><b>LUNAR</b><p>{d.lunar}</p></div>
              <div><b>Agenție clasică</b><p>{d.agency}</p></div>
              <div><b>Site făcut cu AI</b><p>{d.ai}</p></div>
            </div>
          </section>
        ))}
        <h2>Pe scurt</h2>
        <p>Dacă vrei un site de firmă care aduce cereri, fără investiție la început și fără să-l administrezi tu, LUNAR e varianta cea mai avantajoasă. Plătești lunar un preț fix, primești design personalizat, îmbunătățiri lunare și, după 12 plăți, site-ul e al tău.</p>
        <p>Vrei mai multe detalii? Citește <Link className="inl" href="/resurse/diy-ai-builder-sau-agentie">ghidul complet, cu test de 5 întrebări</Link>, sau vezi <Link className="inl" href="/garantii">garanțiile LUNAR</Link>.</p>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </PageShell>
  );
}
