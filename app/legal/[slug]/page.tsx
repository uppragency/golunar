import type { Metadata } from "next";
import PageShell from "@/components/site/PageShell";
import { notFound } from "next/navigation";

const PAGES: Record<string, string> = {
  termeni: "Termeni și condiții · Contract-cadru",
  confidentialitate: "Politica de confidențialitate",
  cookies: "Politica de cookie-uri",
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: PAGES[slug] ?? "Legal", robots: { index: false } };
}

export default async function Legal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = PAGES[slug];
  if (!title) notFound();
  return (
    <PageShell
      crumbs={[[`/legal/${slug}`, title]]}
      eyebrow="Legal"
      title={title}
      lede="Documentul este în revizuire juridică și va fi publicat înainte de lansarea comercială."
      cta={false}
    >
      <article className="article">
        <h2>Ai întrebări?</h2>
        <p>Scrie-ne la <a className="inl" href="mailto:hello@golunar.ro">hello@golunar.ro</a> și îți răspundem în cel mult 48 de ore lucrătoare.</p>
        <p>Operator: UPPRMARKETING S.R.L., CIF 52762670, Reg. com. J2025081624004, Sat Chiajna, Com. Chiajna, Str. Sergent Ilie Petre Nr. 84, Bl. 1, Et. 7, Ap. 716, Județ Ilfov.</p>
      </article>
    </PageShell>
  );
}
