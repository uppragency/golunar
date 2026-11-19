/** Întrebările frecvente de pe pagina principală (folosite și în JSON-LD FAQPage). */
export const FAQ: Record<string, [string, string][]> = {
  Abonament: [
    ["Ce primesc concret?", "Website personalizat, domeniu, hosting, SSL, mentenanță, backup zilnic, suport și numărul de îmbunătățiri lunare din plan."],
    ["Există taxă de creare sau de setup?", "Nu. Designul și dezvoltarea sunt incluse în abonament. Plătești doar prima lună la comandă."],
    ["Prețurile includ TVA?", "Da. Prețul afișat este prețul final pe care îl plătești, fără TVA adăugat la factură."],
    ["Ce diferență este între planuri?", "Esențial acoperă prezența online. Creștere adaugă SEO, vizibilitate în AI și tracking de conversii. Partener adaugă landing pages, CRO și automatizări."],
  ],
  "Plată și facturare": [
    ["Cum plătesc?", "Cu cardul, prin debitare automată lunară, sau prin transfer bancar pe baza proformei trimise cu 7 zile înainte de scadență."],
    ["Primesc factură fiscală?", "Da. Fiecare plată generează factură, transmisă automat în SPV prin e-Factura și disponibilă în contul tău."],
    ["Ce se întâmplă dacă plata eșuează?", "Reîncercăm automat de 3 ori în 7 zile și te anunțăm pe email. După 14 zile fără plată, site-ul intră în mentenanță."],
  ],
  "Anulare și proprietate": [
    ["Pot anula oricând?", "Da, fără perioadă minimă. Abonamentul se oprește la finalul perioadei deja plătite."],
    ["Când devine website-ul al meu?", "După 12 plăți lunare și încheierea primei perioade de 12 luni. Domeniul este al tău din prima zi."],
    ["Ce se întâmplă dacă plec înainte de 12 luni?", "Renunți la website fără alte costuri sau plătești ratele rămase până la 12, la valoarea lunară curentă, și preiei site-ul."],
    ["Primesc codul-sursă?", "Da, după transferul proprietății, la cerere, în maximum 15 zile lucrătoare. Componentele terțe rămân sub licențele lor."],
  ],
  "Livrare și suport": [
    ["Ce se întâmplă dacă lansarea întârzie?", "Dacă lansarea depășește 10 zile lucrătoare din vina noastră, luna următoare de abonament e gratuită. Nu returnăm bani, compensăm cu o lună fără plată. Zilele în care așteptăm materiale de la tine nu se numără."],
    ["Ce înseamnă o îmbunătățire?", "O modificare delimitată: conținut, o secțiune nouă, o ajustare de navigare sau o integrare. Cererile mari se împart, cu acordul tău."],
    ["Se reportează îmbunătățirile nefolosite?", "Nu. Fiecare lună are propriul număr de îmbunătățiri."],
    ["Garantați poziții în Google?", "Nu. Nimeni nu poate garanta poziții, trafic sau mențiuni în răspunsurile AI. Garantăm munca, raportarea și transparența."],
  ],
};
