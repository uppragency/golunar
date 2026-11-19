import { SITE_URL } from "@/lib/env";
import { PLANS } from "@/lib/plans";

export const ORG_ID = `${SITE_URL}/#org`;
export const SITE_ID = `${SITE_URL}/#website`;

/** Preview/dev nu se indexează niciodată. */
export const IS_PROD = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "LUNAR",
  alternateName: "GO LUNAR",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-512.png`, width: 512, height: 512 },
  email: "hello@golunar.ro",
  description: "Website-uri personalizate pe abonament lunar pentru firme din România: lansare în 10 zile lucrătoare, hosting și îmbunătățiri incluse, proprietate după 12 plăți.",
  areaServed: { "@type": "Country", name: "România" },
  knowsLanguage: ["ro", "en"],
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "hello@golunar.ro", availableLanguage: ["Romanian", "English"], areaServed: "RO" },
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: "LUNAR",
  inLanguage: "ro-RO",
  publisher: { "@id": ORG_ID },
};

export const offerCatalogLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/#service`,
  name: "Website pe abonament",
  serviceType: "Creare, găzduire și îmbunătățire website pe abonament lunar",
  description: "Website personalizat fără taxă de creare: design, dezvoltare, domeniu, hosting, mentenanță și îmbunătățiri lunare într-un abonament. Lansare în 10 zile lucrătoare. Proprietate după 12 plăți.",
  provider: { "@id": ORG_ID },
  areaServed: { "@type": "Country", name: "România" },
  url: SITE_URL,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Abonamente LUNAR",
    itemListElement: (["essential", "growth", "partner"] as const).map((p) => ({
      "@type": "Offer",
      name: `Plan ${PLANS[p].name}`,
      price: PLANS[p].ron,
      priceCurrency: "RON",
      url: `${SITE_URL}/#abonamente`,
      availability: "https://schema.org/InStock",
      priceSpecification: { "@type": "UnitPriceSpecification", price: PLANS[p].ron, priceCurrency: "RON", unitText: "lună", valueAddedTaxIncluded: true, billingDuration: "P1M" },
      itemOffered: { "@type": "Service", name: `Website pe abonament · ${PLANS[p].name}`, description: `${PLANS[p].improvements} ${PLANS[p].improvements === 1 ? "îmbunătățire" : "îmbunătățiri"} pe lună incluse.` },
    })),
  },
};

export const faqLd = (faq: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export const JsonLd = ({ data }: { data: object | object[] }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
);
