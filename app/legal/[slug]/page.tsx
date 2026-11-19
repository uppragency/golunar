import type { Metadata } from "next";
import Link from "next/link";
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
    <main className="wrap" style={{ padding: "120px 0 80px", maxWidth: 760 }}>
      <Link href="/" className="logo"><i />LUNAR</Link>
      <h1 style={{ fontSize: "clamp(36px,5vw,56px)", margin: "40px 0 16px" }}>{title}</h1>
      <p className="muted">Documentul este în revizuire juridică și va fi publicat înainte de lansarea comercială. Pentru întrebări: <a href="mailto:salut@golunar.ro" style={{ textDecoration: "underline" }}>salut@golunar.ro</a>.</p>
    </main>
  );
}
