export type ResourceCategory = "ghid" | "instrument" | "articol" | "template" | "checklist";

export const CATEGORIES: { key: ResourceCategory | "toate"; label: string }[] = [
  { key: "toate", label: "Toate" },
  { key: "ghid", label: "Ghiduri" },
  { key: "instrument", label: "Instrumente" },
  { key: "articol", label: "Articole" },
  { key: "template", label: "Template-uri" },
  { key: "checklist", label: "Checklist-uri" },
];

export type Resource = {
  slug: string;
  title: string;
  excerpt: string;
  kicker: string;
  categories: ResourceCategory[];
  minutes: number;
  extra?: string;
  updated: string; // YYYY-MM-DD
  keyword: string;
  metaTitle: string;
  metaDesc: string;
};

export const RESOURCES: Resource[] = [
  {
    slug: "abonament-vs-plata-unica",
    title: "Abonament sau plată unică: costul real pe 3 ani",
    excerpt: "Pune cifrele tale în calculator și vezi cât te costă cu adevărat un website în 36 de luni, cu tot cu mentenanță și modificări.",
    kicker: "Ghid · Calculator",
    categories: ["ghid", "instrument"],
    minutes: 8,
    extra: "instrument inclus",
    updated: "2026-11-19",
    keyword: "cât costă un website",
    metaTitle: "Cât costă un website: abonament vs plată unică",
    metaDesc: "Cât costă un website în 3 ani: compară abonamentul lunar cu plata unică, cu mentenanță și modificări incluse. Calculator gratuit cu cifrele tale.",
  },
  {
    slug: "diy-ai-builder-sau-agentie",
    title: "DIY, AI builder sau agenție: ce alegi în 2026",
    excerpt: "Trei drumuri spre un website, comparate pe timp, cost, control și rezultate. Plus un test de 5 întrebări care îți spune ce ți se potrivește.",
    kicker: "Comparație",
    categories: ["articol", "ghid"],
    minutes: 6,
    updated: "2026-11-19",
    keyword: "AI website builder sau agenție",
    metaTitle: "AI website builder, DIY sau agenție în 2026",
    metaDesc: "AI website builder, DIY sau agenție web? Comparăm timpul, costul, controlul și rezultatele, plus un test de 5 întrebări care îți arată ce ți se potrivește.",
  },
  {
    slug: "cum-pregatesti-brief-ul-unui-website",
    title: "Cum pregătești brief-ul unui website",
    excerpt: "Ce informații îi dai echipei ca să primești din prima un site care vinde. Cu model gata de completat și copiat.",
    kicker: "Template",
    categories: ["template", "ghid"],
    minutes: 5,
    extra: "model descărcabil",
    updated: "2026-11-19",
    keyword: "brief website",
    metaTitle: "Brief website: cum îl pregătești, cu model gratuit",
    metaDesc: "Cum pregătești brief-ul unui website: ce informații îi dai echipei ca să primești din prima un site care vinde. Model de brief gratuit, gata de copiat.",
  },
  {
    slug: "schimbi-furnizorul-web-fara-sa-pierzi-trafic",
    title: "Schimbi furnizorul web fără să pierzi trafic",
    excerpt: "Pașii exacți pentru o migrare fără pierderi de poziții în Google, emailuri sau date. Checklist interactiv, pe care îl bifezi pe parcurs.",
    kicker: "Checklist",
    categories: ["checklist", "ghid"],
    minutes: 7,
    updated: "2026-11-19",
    keyword: "migrare site fără pierdere de trafic",
    metaTitle: "Migrare site fără să pierzi traficul din Google",
    metaDesc: "Migrare site fără pierdere de trafic: pașii exacți pentru redirecționări, emailuri și date, ca să păstrezi pozițiile din Google. Checklist interactiv gratuit.",
  },
  {
    slug: "lunar-vs-wix",
    title: "LUNAR vs Wix: ce alegi pentru site-ul firmei",
    excerpt: "Wix îți dă un editor și te lasă singur cu designul, textele și SEO-ul. LUNAR face totul pentru tine. Comparăm cost, timp, rezultat și proprietate.",
    kicker: "Comparație",
    categories: ["articol", "ghid"],
    minutes: 6,
    updated: "2026-11-20",
    keyword: "wix sau agenție",
    metaTitle: "Wix sau agenție web? LUNAR vs Wix pentru firme",
    metaDesc: "Wix sau agenție web: comparăm costul real, timpul tău, designul, SEO-ul și proprietatea site-ului. Când merită Wix și când un site făcut de LUNAR.",
  },
  {
    slug: "lunar-vs-wordpress",
    title: "LUNAR vs WordPress: site rapid fără pluginuri de întreținut",
    excerpt: "WordPress e flexibil, dar cere hosting, teme, pluginuri și actualizări constante. Comparăm costul total, securitatea și viteza.",
    kicker: "Comparație",
    categories: ["articol", "ghid"],
    minutes: 7,
    updated: "2026-11-20",
    keyword: "wordpress sau site personalizat",
    metaTitle: "WordPress sau site personalizat? LUNAR vs WordPress",
    metaDesc: "WordPress sau site personalizat: comparăm costul total, securitatea, viteza și mentenanța. Când are sens WordPress și când un site LUNAR pe abonament.",
  },
  {
    slug: "lunar-vs-freelancer",
    title: "LUNAR vs freelancer: cine îți face site-ul",
    excerpt: "Un freelancer bun poate fi o alegere excelentă. Ce se întâmplă însă după lansare, la modificări, la probleme sau dacă dispare? Comparăm riscurile.",
    kicker: "Comparație",
    categories: ["articol", "ghid"],
    minutes: 6,
    updated: "2026-11-20",
    keyword: "freelancer site web",
    metaTitle: "Freelancer pentru site web sau abonament LUNAR?",
    metaDesc: "Freelancer pentru site web sau abonament LUNAR: comparăm prețul, termenul, mentenanța, garanțiile și ce se întâmplă dacă furnizorul nu mai răspunde.",
  },
];

export const resourceBySlug = (slug: string) => RESOURCES.find((r) => r.slug === slug);
