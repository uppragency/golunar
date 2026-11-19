import type { Metadata } from "next";
import Landing from "@/components/site/Landing";
import { FAQ } from "@/lib/faq";
import { JsonLd, faqLd, offerCatalogLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Website pe abonament lunar, fără taxă de creare · LUNAR" },
  description: "Website pe abonament lunar, fără taxă de creare: design personalizat, hosting și îmbunătățiri incluse. Lansare în 10 zile lucrătoare. Al tău după 12 plăți.",
  alternates: { canonical: "/" },
  openGraph: { title: "Website pe abonament lunar · LUNAR", description: "Website personalizat fără taxă de creare. Lansare în 10 zile lucrătoare, îmbunătățiri lunare, al tău după 12 plăți.", url: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd data={[offerCatalogLd, faqLd(Object.values(FAQ).flat())]} />
      <Landing />
    </>
  );
}
