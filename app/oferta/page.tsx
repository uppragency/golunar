import type { Metadata } from "next";
import AdsLanding from "@/components/site/AdsLanding";

/** Landing page pentru Google Ads: fără meniu, un singur CTA, neindexat și fără linkuri din site. */
export const metadata: Metadata = {
  title: { absolute: "Website pentru firma ta, fără avans · LUNAR" },
  description: "Website personalizat pe abonament lunar: prima lună 4,99 lei, lansare în 10 zile lucrătoare, hosting și îmbunătățiri incluse. Al tău după 12 plăți.",
  alternates: { canonical: "/oferta" },
  robots: { index: false, follow: false },
};

export default function Oferta() {
  return <AdsLanding />;
}
