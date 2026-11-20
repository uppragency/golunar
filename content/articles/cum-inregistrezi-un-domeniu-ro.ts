import type { Article } from "./types";

const a: Article = {
  body: `Cum înregistrezi un domeniu .ro? Verifici dacă numele e liber, alegi un registrar acreditat de ROTLD (registrul domeniilor .ro), completezi datele titularului, plătești și, în câteva minute, domeniul e al tău. Din martie 2018, domeniile .ro se plătesc anual: tariful registrului e de 12 euro plus TVA pe an, iar registrarii îl vând la prețuri care pot diferi.

În acest ghid găsești pașii exacți, cât costă, pe numele cui să înregistrezi domeniul și greșelile care pot duce la pierderea lui.

## Pașii, pe scurt

1. Alegi numele și verifici dacă e disponibil.
2. Alegi registrarul (direct ROTLD sau un partener acreditat).
3. Completezi datele titularului: firma, cu CUI, sau persoana fizică.
4. Alegi perioada: între 1 și 10 ani.
5. Plătești și confirmi.
6. Setezi DNS-ul către găzduirea site-ului și a emailului.

## Pasul 1: alegi numele

Un nume bun de domeniu este:

- **scurt și ușor de spus la telefon:** fără cratime dacă se poate, fără litere care se confundă;
- **fără diacritice:** tehnic sunt posibile, dar complică emailul și tastarea;
- **apropiat de numele firmei sau al mărcii,** nu neapărat identic cu denumirea juridică;
- **verificat la marcă:** caută pe site-ul OSIM că nu folosești o marcă înregistrată de altcineva.

Dacă varianta dorită e ocupată, încearcă: numele + orașul, numele + domeniul de activitate sau o formulare scurtă a serviciului.

## Pasul 2: verifici disponibilitatea

Pe [rotld.ro](https://rotld.ro) sau pe site-ul oricărui registrar există un formular de verificare. Dacă domeniul e ocupat, poți vedea în baza WHOIS data de expirare. Un domeniu neplătit e șters după o perioadă de grație de 90 de zile de la expirare, apoi poate fi înregistrat din nou.

## Pasul 3: alegi registrarul

| Variantă | Avantaje | Dezavantaje |
|---|---|---|
| Direct la ROTLD | Tarif de referință, 12 euro plus TVA pe an | Doar domeniul, fără găzduire sau DNS administrat ușor |
| Registrar acreditat (firme de hosting) | Domeniu, DNS, email și găzduire în același loc | Prețuri diferite, uneori promoționale în primul an |
| Prin agenția web | Nu te ocupi tu de nimic | Risc mare dacă domeniul e înregistrat pe numele agenției |

Compară prețul de reînnoire, nu doar pe cel din primul an. Unele oferte au primul an redus și reînnoiri mai scumpe.

## Pasul 4: titularul domeniului

Cea mai importantă decizie din tot procesul. **Titularul este cel care deține dreptul de folosință asupra domeniului.**

- Pentru un site de firmă, înregistrează domeniul **pe firmă**, cu CUI-ul ei.
- Folosește o adresă de email a firmei pe care o controlezi pe termen lung (nu adresa personală a unui angajat).
- Dacă agenția sau dezvoltatorul face înregistrarea pentru tine, cere explicit ca titularul să fie firma ta și să primești datele de acces la contul de registrar.

> **Capcana frecventă** Domeniul înregistrat pe numele agenției sau al dezvoltatorului. Dacă relația se termină, transferul poate dura luni sau poate deveni imposibil fără proces. Verifică titularul în WHOIS sau cere un document de la registrar.

## Pasul 5: perioada și reînnoirea

Poți înregistra un domeniu .ro pentru 1 până la 10 ani. Avantajul unei perioade lungi: nu riști să uiți reînnoirea, iar prețul e blocat.

Ce să faci ca să nu-l pierzi:

- activează reînnoirea automată, dacă registrarul o oferă;
- ține emailul de contact al domeniului actualizat;
- notează data de expirare în calendar, cu o lună înainte;
- dacă domeniul expiră, ai 90 de zile să-l reînnoiești înainte de ștergere, dar site-ul și emailul se pot opri imediat.

## Pasul 6: setezi DNS-ul

După înregistrare, domeniul trebuie „îndreptat” spre serviciile pe care le folosești:

| Înregistrare DNS | Pentru ce e |
|---|---|
| A sau CNAME | Adresa site-ului (unde e găzduit) |
| MX | Unde se primesc emailurile |
| SPF, DKIM, DMARC (TXT) | Autentificarea emailurilor, ca să nu ajungă în spam |
| TXT de verificare | Confirmarea proprietății pentru Google Search Console, servicii de email etc. |

Dacă site-ul și emailul sunt la furnizori diferiți, setează fiecare înregistrare separat. La mutarea site-ului, schimbi doar înregistrările pentru site și lași neatinse cele de email.

## Cât costă un domeniu .ro

| Cost | Valoare |
|---|---|
| Tarif ROTLD (vânzare directă) | 12 euro plus TVA pe an |
| La registrari parteneri | Variabil, de obicei comparabil cu tariful ROTLD, cu promoții în primul an |
| Transfer între registrari | Gratuit sau cu taxă mică, de obicei include o perioadă de reînnoire |
| Domenii deja ocupate, cumpărate de la titular | Negociabil, de la câteva sute la mii de euro |

Domeniul nu include găzduirea site-ului și nici emailul. Acestea sunt servicii separate.

## .ro sau .com?

Pentru o firmă care lucrează cu clienți din România, **.ro** e alegerea naturală: e recunoscut, inspiră încredere locală și semnalează publicul țintă. Un .com are sens dacă vinzi internațional. Dacă bugetul permite, înregistrează ambele și redirecționează-l pe unul spre celălalt, ca să protejezi numele.

## Transferul unui domeniu .ro

Dacă vrei să muți domeniul la alt registrar sau să-l preiei de la un fost furnizor:

1. verifică în WHOIS cine e titularul;
2. obține codul de autorizare (codul de transfer) de la registrarul actual sau de la titular;
3. inițiază transferul la noul registrar.

Dacă titularul nu ești tu, ai nevoie mai întâi de schimbarea titularului, cu acordul titularului actual. De aceea contează atât de mult pasul 4.

## Domeniul la LUNAR

La LUNAR, domeniul este inclus în abonament și e înregistrat **pe numele firmei tale din prima zi**. Dacă ai deja un domeniu, îl folosim pe acela și te ajutăm cu setările DNS, fără să atingem emailurile existente. Dacă vii de la alt furnizor, vezi și oferta de [migrare gratuită](/migrare-website).

## Exemple de nume bune și mai puțin bune

| Nume | Evaluare | De ce |
|---|---|---|
| dentalpopescu.ro | Bun | Scurt, ușor de spus, legat de marcă |
| clinica-stomatologica-dr-popescu-iasi.ro | Slab | Prea lung, greu de spus la telefon și de tastat |
| renovaricluj.ro | Bun pentru un nume descriptiv | Spune serviciul și orașul |
| r3novari.ro | Slab | Cifra în loc de literă creează confuzie |
| salonana.ro | Bun | Scurt și memorabil |
| saloanaa.ro | Slab | Literele dublate sunt greu de dictat |

## Emailul pe domeniu

Odată ce ai domeniul, folosește-l și pentru email: nume@firmata.ro arată mult mai profesionist decât o adresă gratuită. Ai mai multe variante: emailul inclus la unele pachete de găzduire, sau servicii dedicate precum Google Workspace sau Microsoft 365, cu cost pe utilizator. Indiferent de variantă, configurează SPF, DKIM și DMARC, ca emailurile să nu ajungă în spam.

## Lista de verificare după înregistrare

1. Titularul domeniului e firma ta, cu CUI.
2. Ai datele de acces la contul de registrar, salvate în siguranță.
3. Reînnoirea automată e activă sau data de expirare e în calendar.
4. DNS-ul e setat pentru site și pentru email.
5. Autentificarea emailului (SPF, DKIM, DMARC) e configurată.
6. Domeniul e adăugat în Google Search Console.

## Domeniul și securitatea

Domeniul e o țintă pentru fraude: emailuri false care anunță că „domeniul expiră” și cer plata pe un link necunoscut. Plătește reînnoirea doar din contul registrarului tău sau la ROTLD, niciodată dintr-un link primit pe email. Activează autentificarea în doi pași pentru contul de registrar, dacă e disponibilă.

## Concluzie

Înregistrarea unui domeniu .ro durează câteva minute și costă în jur de 12 euro plus TVA pe an la registru. Esențial e să-l înregistrezi pe firma ta, cu un email pe care îl controlezi, și să nu ratezi reînnoirea. Restul (DNS, găzduire, email) se poate schimba oricând, dar titularul greșit poate costa luni de bătăi de cap.

Ai domeniul și vrei să vezi cum stă site-ul? Rulează [auditul gratuit](/audit). Vrei să afli cât costă și site-ul în sine? Citește [cât costă un site de prezentare](/resurse/cat-costa-un-site-de-prezentare).`,
  faq: [
    ["Cât costă un domeniu .ro pe an?", "Tariful ROTLD pentru vânzarea directă este de 12 euro plus TVA pe an. Registrarii parteneri au prețuri proprii, uneori cu promoții în primul an, așa că verifică și prețul de reînnoire."],
    ["Pentru câți ani pot înregistra un domeniu .ro?", "Pentru o perioadă între 1 și 10 ani. După expirare ai 90 de zile să-l reînnoiești înainte să fie șters, dar site-ul și emailul pot înceta să funcționeze imediat."],
    ["Pe numele cui trebuie înregistrat domeniul firmei?", "Pe firmă, cu CUI-ul ei, și cu o adresă de email controlată de firmă. Evită înregistrarea pe numele agenției sau al unui angajat."],
    ["Domeniul include și găzduirea site-ului?", "Nu. Domeniul e doar adresa. Găzduirea site-ului și emailul sunt servicii separate, care se leagă de domeniu prin setările DNS."],
    ["Pot cumpăra un domeniu .ro care e deja ocupat?", "Poți negocia direct cu titularul sau aștepta ca domeniul să expire și să fie șters, dacă titularul nu îl reînnoiește. Data de expirare se vede în WHOIS."],
  ],
};
export default a;
