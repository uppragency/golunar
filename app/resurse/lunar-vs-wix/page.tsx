import type { Metadata } from "next";
import Link from "next/link";
import ResourceShell from "@/components/site/ResourceShell";
import VsTable from "@/components/site/VsTable";
import { resourceBySlug } from "@/lib/resources";

const r = resourceBySlug("lunar-vs-wix")!;
export const metadata: Metadata = {
  title: r.metaTitle,
  description: r.metaDesc,
  alternates: { canonical: `/resurse/${r.slug}` },
  openGraph: { title: r.title, description: r.metaDesc, type: "article", url: `/resurse/${r.slug}`, publishedTime: r.updated, modifiedTime: r.updated },
};

const FAQ: [string, string][] = [
  ["Wix este mai ieftin decât LUNAR?", "Abonamentul Wix în sine poate costa mai puțin pe lună. Diferența apare la timpul tău: designul, textele, pozele, SEO-ul și actualizările le faci singur. Dacă îți evaluezi timpul, costul real crește rapid."],
  ["Pot muta un site Wix la LUNAR?", "Da. Wix nu permite exportul codului, așa că refacem site-ul de la zero, păstrăm textele și imaginile pe care le ai și setăm redirecționările ca să nu pierzi pozițiile din Google. Domeniul îl transferi la tine."],
  ["Al cui e site-ul la Wix?", "Conținutul e al tău, dar site-ul rulează doar pe platforma Wix și nu poate fi mutat ca atare. La LUNAR, după 12 plăți site-ul devine al tău și primești codul-sursă la cerere."],
];

const ROWS: [string, string, string][] = [
  ["Cine face site-ul", "Echipa LUNAR: design, texte structurate, dezvoltare, SEO tehnic", "Tu, în editorul Wix, pornind de la un șablon"],
  ["Timpul tău", "Un brief de 15 minute și aprobarea designului", "Zeci de ore pentru design, texte, setări și SEO"],
  ["Design", "Unic, făcut pentru afacerea ta", "Șablon, folosit și de alte mii de site-uri"],
  ["Viteză", "Pagini generate dinainte, scor PageSpeed țintă peste 90", "Depinde de șablon și de aplicațiile adăugate"],
  ["Modificări lunare", "Incluse în abonament (1, 2 sau 4 pe lună)", "Le faci singur sau plătești pe cineva"],
  ["Proprietate", "Site-ul e al tău după 12 plăți, cod-sursă la cerere", "Site-ul rulează doar pe Wix și nu se poate exporta"],
  ["Suport", "Răspuns în 48h lucrătoare, de la oamenii care ți-au făcut site-ul", "Centrul de ajutor și suportul general al platformei"],
];

export default function Page() {
  return (
    <ResourceShell r={r} faq={FAQ}>
      <article className="article">
        <p>Wix e una dintre cele mai cunoscute platforme pentru site-uri făcute singur. E o alegere bună pentru un proiect personal sau un test rapid. Pentru site-ul unei firme care vrea clienți din Google, întrebarea nu e doar cât costă abonamentul, ci cât timp investești și ce rezultat obții.</p>
      </article>
      <VsTable other="Wix" rows={ROWS} />
      <article className="article">
        <h2>Când are sens Wix</h2>
        <ul>
          <li>Ai timp să lucrezi singur la design, texte și setări.</li>
          <li>Ai nevoie de o pagină simplă, temporară, pentru un eveniment sau un test.</li>
          <li>Bugetul e foarte mic și nu contează poziția în Google.</li>
        </ul>
        <h2>Când are sens LUNAR</h2>
        <ul>
          <li>Vrei un site care arată profesionist din prima zi, fără să înveți un editor.</li>
          <li>Vrei clienți din Google: SEO tehnic, viteză, date structurate, incluse.</li>
          <li>Vrei pe cineva care face modificările lunar, nu un instrument în plus de administrat.</li>
          <li>Vrei ca site-ul să fie al tău, nu închiriat pe o platformă.</li>
        </ul>
        <div className="callout"><b>Regula simplă</b><p>Dacă timpul tău valorează mai mult decât diferența de preț, un site făcut pentru tine iese mai ieftin decât unul făcut de tine.</p></div>
        <p>Vezi și comparația completă <Link className="inl" href="/lunar-vs-agentie-vs-ai">LUNAR vs agenție vs AI</Link> sau <Link className="inl" href="/website-4-99-lei">începe cu 4,99 lei prima lună</Link>.</p>
        <h2>Întrebări frecvente</h2>
        {FAQ.map(([q, a]) => (<div key={q}><h3>{q}</h3><p>{a}</p></div>))}
      </article>
    </ResourceShell>
  );
}
