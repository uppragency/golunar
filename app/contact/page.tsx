import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import ContactForm from "@/components/site/ContactForm";
import { PAYEE } from "@/lib/bank";
import { SITE_URL } from "@/lib/env";
import { ORG_ID } from "@/lib/seo";

const DESC = "Contactează LUNAR pentru un website nou, o întrebare despre abonament, plăți și facturi sau un parteneriat. Răspundem în cel mult o zi lucrătoare.";

export const metadata: Metadata = {
  title: { absolute: "Contact · LUNAR" },
  description: DESC,
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact · LUNAR", description: DESC, url: "/contact", type: "website" },
};

export default function ContactPage() {
  return (
    <PageShell
      crumbs={[["/contact", "Contact"]]}
      eyebrow="Contact"
      title={<>Scrie-ne. <span className="dim">Răspundem în cel mult o zi lucrătoare.</span></>}
      lede="Alege subiectul, apoi lasă-ne un mesaj. Pentru un website nou, spune-ne ce face firma ta și dacă ai deja un site."
      jsonLd={[{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact LUNAR", url: `${SITE_URL}/contact`, inLanguage: "ro-RO", about: { "@id": ORG_ID } }]}
      cta={false}
    >
      <div className="ct-grid">
        <ContactForm />
        <aside className="ct-side">
          <div className="ct-box">
            <h3>Email</h3>
            <a href="mailto:hello@golunar.ro">hello@golunar.ro</a>
            <p>Răspuns în cel mult o zi lucrătoare, de luni până vineri.</p>
          </div>
          <div className="ct-box">
            <h3>Ești deja client?</h3>
            <p>Cererile de modificare, plățile și facturile sunt în <a href="/cont">contul tău LUNAR</a>.</p>
          </div>
          <div className="ct-box">
            <h3>Date firmă</h3>
            <p>{PAYEE.name}<br />CIF {PAYEE.cif} · {PAYEE.regCom}<br />{PAYEE.address}</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
