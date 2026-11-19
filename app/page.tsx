import type { Metadata } from "next";
import Landing from "@/components/site/Landing";
import { FAQ } from "@/lib/faq";
import { JsonLd, faqLd, offerCatalogLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Website pe abonament, prima lună 4,99 lei · LUNAR" },
  description: "Website pe abonament, fără taxă de creare: începi cu 4,99 lei în prima lună. Design personalizat, hosting și îmbunătățiri incluse. Al tău după 12 plăți.",
  alternates: { canonical: "/" },
  openGraph: { title: "Website pe abonament, prima lună 4,99 lei · LUNAR", description: "Website personalizat fără taxă de creare. Începi cu 4,99 lei în prima lună, live în 10 zile lucrătoare, al tău după 12 plăți.", url: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd data={[offerCatalogLd, faqLd(Object.values(FAQ).flat())]} />
      <Landing />
    </>
  );
}
