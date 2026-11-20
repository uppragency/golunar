/** Întrebările frecvente de pe pagina principală (folosite și în JSON-LD FAQPage). */
export const FAQ: Record<string, [string, string][]> = {
  Abonament: [
    ["Ce primesc concret?", "Website personalizat, domeniu, hosting, SSL, mentenanță, backup zilnic, suport și numărul de îmbunătățiri lunare din plan."],
    ["Există taxă de creare sau de setup?", "Nu. Designul și dezvoltarea sunt incluse în abonament. Plătești doar prima lună la comandă."],
    ["Prețurile includ TVA?", "Da. Prețul afișat este prețul final pe care îl plătești, fără TVA adăugat la factură."],
    ["Ce diferență este între planuri?", "Esențial acoperă prezența online. Creștere adaugă SEO, vizibilitate în AI și tracking de conversii. Partener adaugă landing pages, CRO și automatizări."],
  ],
  "Plată și facturare": [
    ["Cum plătesc?", "Momentan prin transfer bancar, în lei, către UPPRMARKETING S.R.L. Primești datele de plată imediat după comandă și înainte de fiecare scadență. Plata cu cardul va fi disponibilă în curând."],
    ["Cum funcționează oferta de 4,99 lei?", "Pentru clienții noi, prima lună pe planul Esențial costă 4,99 lei (1 €), TVA inclus. Codul GOLUNAR se aplică automat când alegi planul Esențial. Din luna a doua plătești 269 lei (53 €) pe lună. Perioada minimă a planului este de 3 luni."],
    ["Cum folosesc un cod de reducere?", "Introdu codul la „Ai un cod de reducere?”, în rezumatul abonamentului sau în pagina de plată. Reducerea se aplică ratelor indicate de cod și apare în desfășurătorul de plată."],
    ["Primesc factură fiscală?", "Da. Pentru fiecare plată emitem factură fiscală pe CUI-ul firmei, transmisă în SPV prin e-Factura și disponibilă în contul tău."],
    ["Pot plăti tot anul o dată?", "Da. La comandă alegi plata anuală: plătești 12 luni o singură dată, cu 20% reducere, iar website-ul devine al tău imediat după confirmarea plății. Plata anuală nu se cumulează cu alte coduri de reducere."],
    ["Ce se întâmplă dacă întârzii o plată?", "Îți trimitem amintiri pe email în zilele 1, 5 și 10 după scadență. După 14 zile fără plată, site-ul poate fi suspendat temporar, până la plata ratei."],
  ],
  "Anulare și proprietate": [
    ["Există o perioadă minimă?", "Da: 3 luni la planul Esențial, 2 luni la Creștere și o lună la Partener. După această perioadă anulezi oricând, iar abonamentul se oprește la finalul lunii deja plătite."],
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

/** Întrebări în plus, afișate doar pe pagina /intrebari-frecvente. */
export const FAQ_EXTRA: Record<string, [string, string][]> = {
  "Migrare și site existent": [
    ["Am deja un site. Îl puteți muta la LUNAR?", "Da, gratuit. Preluăm textele, imaginile și paginile importante, construim site-ul nou în 10 zile lucrătoare și facem redirecturi de pe adresele vechi."],
    ["Pierd pozițiile din Google la mutare?", "Riscul e mic dacă mutarea se face corect: păstrăm adresele importante sau le redirecționăm permanent (301) și verificăm după lansare că paginile vechi duc unde trebuie."],
    ["Ce se întâmplă cu emailurile pe domeniu?", "Nu se întrerup. Mutăm doar website-ul, iar înregistrările de email ale domeniului rămân neschimbate."],
    ["Ce nu migrăm gratuit?", "Magazine online cu comenzi și conturi de clienți sau funcționalități construite pe pluginuri specifice. Le discutăm separat, înainte de comandă."],
  ],
  Contact: [
    ["Cum vă contactez?", "Din pagina de contact sau la hello@golunar.ro. Răspundem în cel mult o zi lucrătoare."],
    ["Pot vorbi cu cineva înainte să comand?", "Da. Programează o discuție gratuită de 20 de minute pe Google Meet din pagina principală."],
  ],
};
