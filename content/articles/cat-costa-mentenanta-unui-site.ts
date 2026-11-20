import type { Article } from "./types";

const a: Article = {
  body: `Cât costă mentenanța unui site? În România, un abonament de mentenanță pentru un site de prezentare costă de obicei între 240 și 960 de lei pe lună, iar pentru magazinele online prețurile pornesc de la câteva sute de euro. Diferențele mari vin din ce înseamnă „mentenanță” pentru fiecare furnizor: unii fac doar actualizări automate, alții includ backup zilnic, monitorizare, reparații și modificări de conținut.

În acest ghid vezi ce ar trebui să includă mentenanța, cât costă fiecare componentă, ce se întâmplă dacă renunți la ea și cum citești un contract de mentenanță ca să nu plătești pentru lucruri care nu se fac.

## Ce înseamnă mentenanța unui site

Mentenanța e tot ce ține site-ul sigur, rapid și funcțional după lansare. Un site nu e un obiect terminat, ci un program care rulează pe un server, folosește componente care primesc actualizări și e expus zilnic la încercări de atac.

Mentenanța completă are cinci părți:

1. **Actualizări:** sistemul de administrare (de exemplu WordPress), tema și pluginurile primesc periodic versiuni noi, multe cu reparații de securitate.
2. **Securitate:** monitorizarea încercărilor de atac, firewall, scanarea fișierelor modificate, reînnoirea certificatului SSL.
3. **Backup:** copii periodice ale site-ului și ale bazei de date, păstrate în altă locație decât serverul.
4. **Monitorizare:** verificarea automată că site-ul e online și alertă când pică.
5. **Suport și modificări:** cineva care răspunde când ceva nu merge și care face schimbările mici de conținut.

Multe oferte numite „mentenanță” acoperă doar primul punct.

## Cât costă mentenanța: prețuri pe componente

| Componentă | Dacă o faci singur | Dacă o externalizezi |
|---|---|---|
| Actualizări CMS, temă, pluginuri | Timpul tău, 1 până la 3 ore pe lună | Inclusă în orice abonament serios |
| Backup zilnic în altă locație | 0 până la 50 de lei pe lună (plugin sau serviciu) | Inclus sau 30 până la 80 de lei pe lună |
| Monitorizare uptime | Gratuit, cu servicii de bază | Inclusă |
| Securitate (firewall, scanare) | 0 până la 100 de lei pe lună | Inclusă sau separat |
| Modificări de conținut | Timpul tău | 100 până la 300 de lei pe oră sau pachet de ore |
| Intervenții de urgență (site spart, eroare critică) | Greu de făcut fără experiență | 300 până la 1.500 de lei pe intervenție |

Pachetele lunare complete pentru site-uri de prezentare se situează frecvent între 240 și 960 de lei pe lună. Ofertele internaționale arată ordine de mărime similare: aproximativ 100 până la 300 de dolari pe lună pentru un site de afaceri și mult mai mult pentru magazinele online.

## Ce se întâmplă dacă nu faci mentenanță

Un site lăsat fără mentenanță merge, de obicei, câteva luni fără probleme vizibile. Apoi apar, în ordinea frecvenței:

- **Pluginuri vulnerabile.** Majoritatea site-urilor WordPress compromise sunt atacate prin pluginuri sau teme neactualizate, nu prin WordPress în sine.
- **Spam injectat și redirecționări.** Vizitatorii ajung pe site-uri de jocuri de noroc sau farmacii, iar Google marchează site-ul ca periculos.
- **Erori după actualizări automate ale serverului.** Versiunea de PHP se schimbă, un plugin vechi nu mai e compatibil și site-ul afișează o pagină albă.
- **Formulare care nu mai trimit emailuri.** Cea mai scumpă problemă, pentru că nu o observi: pierzi cereri de ofertă săptămâni la rând.
- **Certificat SSL expirat.** Browserele afișează un avertisment roșu și vizitatorii pleacă.

> **De verificat chiar azi** Trimite o cerere de test din formularul de contact al site-ului tău și verifică dacă ajunge. Dacă nu ai făcut asta în ultimele trei luni, e cel mai util minut pe care îl poți investi în site săptămâna asta.

## Mentenanța pe WordPress vs site-uri moderne

Costul mentenanței depinde mult de tehnologia pe care e construit site-ul.

| Criteriu | WordPress cu pluginuri | Site generat static / framework modern |
|---|---|---|
| Actualizări de securitate | Dese, la nucleu, temă și fiecare plugin | Rare, controlate de dezvoltator |
| Suprafață de atac | Mare: panou de administrare public, pluginuri terțe | Mică: fără bază de date expusă public |
| Viteză în timp | Scade pe măsură ce se adaugă pluginuri | Rămâne constantă |
| Cost tipic de mentenanță | Mai mare, recurent | Mai mic, inclus de obicei în găzduire |

Nu înseamnă că WordPress e o alegere greșită. E flexibil și are un ecosistem uriaș. Înseamnă că, dacă alegi WordPress, mentenanța nu e opțională. Am comparat cele două variante în detaliu în [LUNAR vs WordPress](/resurse/lunar-vs-wordpress).

## Ce să ceri într-un contract de mentenanță

Un contract bun spune clar ce se face, cât de des și în cât timp. Verifică aceste puncte:

1. **Frecvența actualizărilor:** săptămânal, lunar sau „la nevoie”? Se testează înainte de a fi aplicate pe site-ul public?
2. **Backup:** cât de des, unde se păstrează și câte zile înapoi poți reveni? Ai făcut vreodată o restaurare de test?
3. **Monitorizare:** cât de des se verifică dacă site-ul e online și cine primește alerta?
4. **Timp de răspuns:** în cât timp răspund la o problemă? Dar la o urgență, cum ar fi site-ul căzut?
5. **Modificări incluse:** câte ore sau câte cereri pe lună? Se reportează orele nefolosite?
6. **Raportare:** primești lunar un raport cu ce s-a făcut?
7. **Ce nu e inclus:** funcționalități noi, redesign, conținut nou, SEO.
8. **Ieșirea din contract:** cu ce preaviz, primești toate accesele și ultimul backup?

## Mentenanța inclusă în abonament

Modelul pe abonament rezolvă problema costurilor ascunse: crearea, găzduirea, mentenanța și un număr fix de modificări sunt într-un singur preț lunar. La LUNAR, toate planurile includ:

- domeniu, găzduire în UE și certificat SSL;
- backup zilnic și monitorizare la fiecare 10 minute;
- actualizări tehnice și de securitate;
- între una și patru îmbunătățiri pe lună, în funcție de plan;
- răspuns în 48 de ore lucrătoare.

Planul Esențial costă 269 de lei pe lună, cu TVA inclus, iar după 12 plăți site-ul devine al tău. Compară costul pe trei ani cu varianta clasică în [calculatorul nostru](/resurse/abonament-vs-plata-unica).

## Cât timp îți ia dacă faci singur mentenanța

Dacă ai un site WordPress și vrei să-l întreții singur, bugetează realist:

| Activitate | Frecvență | Timp |
|---|---|---|
| Actualizări și verificare după actualizare | Săptămânal | 30 de minute |
| Verificarea backup-urilor | Lunar | 20 de minute |
| Test formular de contact | Lunar | 5 minute |
| Verificare viteză și erori în Search Console | Lunar | 30 de minute |
| Modificări de conținut | După nevoie | 1 până la 4 ore pe lună |

În total, între 4 și 8 ore pe lună. Înmulțește cu valoarea unei ore din timpul tău și ai costul real al mentenanței „gratuite”.

## Mentenanța pentru magazine online

Un magazin online cere mai multă atenție decât un site de prezentare: comenzi, plăți, stocuri, facturi, emailuri automate. Pe lângă mentenanța de bază, include:

- testarea periodică a procesului de comandă, de la coș până la emailul de confirmare;
- verificarea integrărilor cu procesatorul de plăți, curierii și programul de facturare;
- actualizarea pluginurilor de plată și livrare, care se schimbă des;
- monitorizarea erorilor la plată și a comenzilor blocate;
- backup mai frecvent, pentru că o zi de comenzi pierdute costă.

De aceea, prețurile pentru magazine pornesc de obicei de la câteva sute de euro pe lună la agenții.

## Cum arată un raport lunar de mentenanță bun

Un raport lunar nu trebuie să fie lung, dar trebuie să arate ce s-a făcut. Exemplu de structură:

| Secțiune | Exemplu de conținut |
|---|---|
| Disponibilitate | 99,98% online, o întrerupere de 6 minute pe 12 ale lunii, cauza și rezolvarea |
| Actualizări | WordPress actualizat, 7 pluginuri actualizate, testat pe 3 pagini principale |
| Securitate | 1.240 de încercări de autentificare blocate, niciun fișier modificat suspect |
| Backup | 30 de backup-uri zilnice, restaurare de test reușită pe 5 ale lunii |
| Viteză | Scor PageSpeed mobil 88, față de 84 luna trecută |
| Modificări | 3 cereri rezolvate: program de sărbători, pagină nouă de serviciu, poze în galerie |
| Recomandări | Înlocuirea unui plugin de galerie care încetinește pagina |

Dacă furnizorul actual nu-ți poate trimite ceva asemănător, nu știi pentru ce plătești.

## Ce faci dacă site-ul a fost spart

Semne: redirecționări spre alte site-uri, conținut străin, avertisment roșu în Google Chrome, emailuri de la Google Search Console despre probleme de securitate. Pașii:

1. **Nu șterge nimic în grabă.** Ai nevoie de fișiere pentru a afla cum a intrat atacatorul.
2. **Schimbă toate parolele:** panoul site-ului, găzduirea, FTP, baza de date, emailul.
3. **Restaurează dintr-un backup curat,** dinainte de atac, dacă există.
4. **Actualizează tot** și elimină pluginurile vulnerabile sau nefolosite.
5. **Cere reverificarea în Google Search Console,** după curățare, ca să dispară avertismentul.
6. **Verifică formularele și emailurile,** atacatorii le folosesc des pentru spam.

O intervenție profesională de curățare costă de obicei între 300 și 1.500 de lei. Un abonament de mentenanță bun previne majoritatea acestor situații.

## Întrebări de pus furnizorului actual

Dacă ai deja pe cineva care se ocupă de site, trimite-i aceste întrebări. Răspunsurile îți arată dacă plătești pentru mentenanță reală:

- Când a fost ultima actualizare a sistemului și a pluginurilor?
- Unde sunt păstrate backup-urile și când ați făcut ultima restaurare de test?
- Cum aflați dacă site-ul pică și în cât timp interveniți?
- Am acces la contul de găzduire și la domeniu?
- Ce s-a făcut concret pe site în ultimele trei luni?

## Mentenanță făcută intern sau externalizată

| Criteriu | Intern (tu sau un angajat) | Externalizată |
|---|---|---|
| Cost direct | Mic | Fix, lunar |
| Cost ascuns | Timp, erori, urgențe | Mic |
| Reacție la urgențe | Depinde de disponibilitate | Garantată prin contract |
| Cunoștințe necesare | Medii spre avansate | Niciuna din partea ta |
| Potrivit pentru | Site-uri simple, echipe cu experiență tehnică | Majoritatea firmelor mici și medii |

## Semne că mentenanța actuală nu funcționează

- Site-ul a picat și ai aflat de la un client, nu de la furnizor.
- Panoul de administrare arată zeci de actualizări în așteptare.
- Formularul de contact nu a mai adus nicio cerere de câteva săptămâni.
- Viteza site-ului a scăzut vizibil în ultimul an.
- Nu știi unde sunt backup-urile și nu ai primit niciodată un raport.

Oricare dintre ele e un motiv să ceri explicații furnizorului actual sau să cauți altul.

## Concluzie

Mentenanța costă, realist, între 240 și 960 de lei pe lună pentru un site de prezentare, dacă o externalizezi complet. Mai important decât prețul e ce acoperă: actualizări testate, backup în altă locație, monitorizare, timp de răspuns garantat și modificări incluse.

Nu știi în ce stare e site-ul tău acum? Rulează [auditul gratuit](/audit): îți arată viteza, problemele tehnice și securitatea conexiunii în 60 de secunde.`,
  faq: [
    ["Cât costă mentenanța unui site pe lună?", "Pentru un site de prezentare, între aproximativ 240 și 960 de lei pe lună, în funcție de ce include: actualizări, backup, monitorizare, securitate și modificări de conținut. Magazinele online costă mai mult."],
    ["Este obligatorie mentenanța pentru un site?", "Nu e obligatorie legal, dar un site neactualizat devine vulnerabil, se încarcă mai greu și poate înceta să funcționeze după schimbări ale serverului. Formularele care nu mai trimit emailuri sunt cea mai scumpă problemă, pentru că nu se observă."],
    ["Ce include mentenanța unui site WordPress?", "Actualizarea WordPress, a temei și a pluginurilor, backup periodic, monitorizare, securitate și, în pachetele bune, un număr de modificări de conținut și un timp de răspuns garantat."],
    ["Pot face singur mentenanța site-ului?", "Da, dacă ai timp și cunoștințe de bază. Bugetează între 4 și 8 ore pe lună și fii pregătit pentru intervenții de urgență, care cer experiență."],
    ["Mentenanța include și SEO?", "De obicei nu. Mentenanța ține site-ul funcțional și sigur. SEO-ul, adică munca pentru poziții mai bune în Google, e un serviciu separat sau inclus doar în planurile superioare."],
  ],
};
export default a;
