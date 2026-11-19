/**
 * Logo-uri pentru caruselul de parteneri de pe homepage.
 * Pune fișierele în /public/partners/ (SVG sau PNG transparent) și completează `logo`.
 * Fără `logo`, se afișează numele ca text. Implicit: tehnologiile pe care construim, până primim logo-urile partenerilor.
 */
export type Partner = { name: string; logo?: string; url?: string };

export const PARTNERS_TITLE = "Construim pe tehnologii de încredere";

export const PARTNERS: Partner[] = [
  { name: "Vercel" },
  { name: "Next.js" },
  { name: "Supabase" },
  { name: "Google Search Console" },
  { name: "Google Analytics" },
  { name: "Resend" },
  { name: "ANAF e-Factura" },
];
