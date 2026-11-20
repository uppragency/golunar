/** Subiectele formularului de contact (pasul 1). */
export const CONTACT_TOPICS = [
  { id: "nou", label: "Vreau un website nou", hint: "Spune-ne ce face firma ta și dacă ai deja un site." },
  { id: "client", label: "Sunt deja client: cerere, plată sau factură", hint: "Pentru modificări pe site, cererea din portal ajunge direct în lucru." },
  { id: "parteneriat", label: "Parteneriat sau colaborare", hint: "Agenții, contabili, freelanceri sau furnizori: spune-ne ce ai în minte." },
  { id: "altceva", label: "Altceva", hint: "Scrie-ne orice întrebare. Răspundem în cel mult o zi lucrătoare." },
] as const;
export type Topic = (typeof CONTACT_TOPICS)[number]["id"];
