/** Verificări obligatorii înainte de lansare (Producție → Lansat). */
export const CHECKLIST = [
  ["ssl", "SSL activ, fără avertismente"],
  ["forms", "Formulare testate, emailurile ajung"],
  ["mobile", "Verificat pe telefon și desktop"],
  ["speed", "PageSpeed mobil peste 90"],
  ["seo", "Titluri, descrieri, sitemap, robots"],
  ["gsc", "Search Console și Analytics conectate"],
  ["legal", "Termeni, confidențialitate, cookie-uri"],
  ["client", "Clientul a aprobat varianta finală"],
] as const;
