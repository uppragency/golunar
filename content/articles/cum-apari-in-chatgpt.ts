import type { Article } from "./types";

const a: Article = {
  body: `Cum apari în ChatGPT, Gemini sau Perplexity când un client întreabă „ce clinică stomatologică bună e în Cluj” sau „cine face site-uri pentru firme mici”? Asistenții AI nu au o listă de reclame și nici o „primă pagină” cu zece rezultate. Ei formulează un singur răspuns, din surse pe care le consideră de încredere. Ca firma ta să fie printre ele, trebuie să fie ușor de găsit, de înțeles și de verificat.

Practica se numește GEO (Generative Engine Optimization, adică optimizare pentru motoarele generative) și se sprijină pe SEO-ul clasic. În acest ghid găsești cum aleg asistenții AI sursele, ce poți face concret pe site și în afara lui și cum verifici dacă apari.

## De ce contează acum

Tot mai mulți oameni pun întrebări direct unui asistent AI în loc să caute pe Google, mai ales pentru recomandări: „ce firmă îmi recomanzi pentru…”. Google însuși afișează rezumate generate de AI deasupra rezultatelor pentru multe căutări. Diferența față de căutarea clasică e importantă:

| Căutare clasică | Asistent AI |
|---|---|
| Zece rezultate pe prima pagină | Un singur răspuns, cu câteva nume sau surse |
| Utilizatorul compară singur | Asistentul compară și recomandă |
| Poți cumpăra poziția prin reclame | Nu există poziții plătite în răspuns |
| Clasarea depinde mult de pagina ta | Contează și ce spun alții despre tine |

Pentru o firmă mică, asta înseamnă și o oportunitate: concurenții mari nu au neapărat un avantaj dacă informațiile tale sunt mai clare și mai bine confirmate.

## Cum aleg asistenții AI sursele

Fiecare asistent funcționează puțin diferit, dar principiile sunt comune:

- **Caută pe web în timp real** pentru întrebările despre firme, prețuri și recomandări. ChatGPT folosește, printre altele, indexul Bing, iar Gemini și rezumatele AI din Google folosesc indexul Google. Dacă nu ești indexat bine în aceste motoare, nu exiști pentru asistent.
- **Preferă informația clară și structurată:** răspunsuri directe la întrebări, liste, tabele, date concrete.
- **Verifică prin mențiuni multiple.** O firmă menționată coerent pe site-ul propriu, în Google Business Profile, în directoare și în articole ale altora pare mai de încredere decât una care apare doar pe propriul site.
- **Ține cont de recenzii și reputație** pentru recomandările locale.

## Pasul 1: fundația tehnică

Înainte de orice strategie de conținut, asistenții trebuie să poată citi site-ul.

### Lasă crawlerele AI să intre

Verifică fișierul robots.txt al site-ului (adresa-ta.ro/robots.txt). Unele teme, pluginuri sau furnizori de găzduire blochează implicit crawlerele AI. Cele mai importante sunt GPTBot și OAI-SearchBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, Google-Extended (pentru Gemini) și Bingbot. Dacă vrei să apari în răspunsuri, nu le bloca.

### Conținut vizibil fără JavaScript

Mulți crawleri AI citesc doar HTML-ul primit de la server, fără să ruleze JavaScript. Dacă textele tale apar doar după ce se încarcă scripturile, pentru ei pagina e goală. Site-urile generate pe server sau static nu au această problemă.

### Date structurate

Datele structurate (schema.org) spun explicit cine ești: denumirea firmei, adresa, telefonul, programul, serviciile, prețurile, întrebările frecvente. Cele mai utile tipuri pentru o firmă de servicii: Organization sau LocalBusiness, Service, FAQPage, Review.

### Fișierul llms.txt

llms.txt e un fișier text simplu, la rădăcina site-ului, care rezumă pentru asistenții AI cine ești, ce oferi și care sunt paginile importante. Nu e încă un standard oficial și nu toți asistenții îl folosesc, dar costă puțin și ajută. Un exemplu poți vedea la [golunar.ro/llms.txt](/llms.txt).

## Pasul 2: conținut pe care AI-ul îl poate cita

Asistenții citează fragmente care răspund direct la o întrebare. Scrie ca să fii citat:

1. **Pornește de la întrebări reale.** Notează întrebările pe care ți le pun clienții la telefon și fă din ele titluri de secțiuni.
2. **Răspunde în prima frază.** Primul rând după titlu trebuie să conțină răspunsul, apoi vin detaliile.
3. **Dă cifre concrete:** prețuri, durate, intervale, garanții. „Implantul durează între 3 și 6 luni” e citabil; „durata variază” nu.
4. **Folosește liste și tabele** pentru comparații și pași.
5. **Arată experiența proprie:** exemple, studii de caz, fotografii, numele specialiștilor. Conținutul generic, care poate fi scris de oricine, are mai puține șanse să fie ales.
6. **Actualizează.** Prețurile și informațiile vechi scad încrederea.

> **Exemplu** În loc de pagina „Servicii” cu o listă, o pagină „Cât costă un implant dentar în Iași” care începe cu intervalul de preț, explică de ce depinde, arată durata tratamentului și răspunde la cinci întrebări frecvente are șanse mult mai mari să fie folosită ca sursă.

## Pasul 3: prezența în afara site-ului

Pentru recomandări, ce spun alții despre tine contează la fel de mult ca site-ul.

- **Google Business Profile complet și activ.** Pentru căutările locale e una dintre cele mai importante surse. Vezi [ghidul complet Google Business Profile](/resurse/google-business-profile-ghid).
- **Aceleași date peste tot.** Denumire, adresă, telefon identice pe site, Google, Facebook, directoare (de exemplu listafirme.ro, paginiaurii.ro, directoare de nișă).
- **Recenzii** pe Google și pe platformele din domeniul tău, cu răspunsuri la ele.
- **Mențiuni în articole și liste:** presă locală, bloguri de nișă, asociații profesionale, parteneri.
- **Bing Places și Bing Webmaster Tools**, pentru că ChatGPT folosește și indexul Bing.

## Pasul 4: verifică dacă apari

Fă un test lunar, cu aceleași întrebări, ca să vezi evoluția:

1. Scrie 10 întrebări pe care le-ar pune un client: „cine face [serviciul tău] în [orașul tău]”, „cât costă [serviciul]”, „[firma ta] părere”.
2. Pune-le în ChatGPT (cu căutare activată), Gemini, Perplexity și în Google, unde apar rezumatele AI.
3. Notează dacă apari, pe ce poziție în răspuns și ce sursă e citată.
4. Pentru întrebările la care apar concurenții și tu nu, uită-te ce surse sunt citate și ce informație au ele în plus.

| Întrebare | ChatGPT | Gemini | Perplexity | Sursa citată |
|---|---|---|---|---|
| Cine face … în … | | | | |
| Cât costă … | | | | |
| [Firma ta] recenzii | | | | |

## Ce nu funcționează

- **Texte umplute cu cuvinte-cheie.** Asistenții caută răspunsuri clare, nu repetiții.
- **Conținut generat în masă, fără experiență proprie.** Nu aduce nimic nou față de sursele pe care asistentul le are deja.
- **Trucuri ascunse în pagină** (text invizibil, instrucțiuni pentru AI). Platformele le detectează, iar riscul de a pierde încrederea e mare.
- **Așteptarea unor rezultate garantate.** Nimeni nu poate garanta mențiuni în răspunsurile AI; poți doar crește probabilitatea.

## Cât durează

Modificările tehnice (robots.txt, date structurate) se văd în câteva săptămâni, după ce paginile sunt recitite. Conținutul nou și mențiunile externe se reflectă în luni. Rezultatele cresc în timp, la fel ca la SEO-ul clasic, și se mențin dacă informațiile rămân actualizate.

## Vizibilitatea în AI la LUNAR

Toate site-urile LUNAR sunt construite să poată fi citite de asistenții AI: conținut generat pe server, date structurate, llms.txt și acces permis crawlerelor AI. În planurile Creștere și Partener, vizibilitatea în AI e inclusă. În planul Esențial, o poți adăuga ca opțiune, cu 99 de lei pe lună, din [configurator](/#abonamente).

## Cum diferă asistenții între ei

Nu toți asistenții AI aleg sursele la fel. Pentru o firmă, contează să știi unde caută fiecare.

| Asistent | De unde ia informațiile pentru firme | Ce contează cel mai mult |
|---|---|---|
| ChatGPT (cu căutare) | Căutare web în timp real, inclusiv indexul Bing, plus surse partenere | Indexarea în Bing, conținut clar, mențiuni în surse de încredere |
| Gemini și rezumatele AI din Google | Indexul Google, Google Maps, Google Business Profile | SEO clasic, profilul Google, recenziile |
| Perplexity | Căutare web proprie, cu citări vizibile | Pagini care răspund direct, surse recente |
| Copilot (Microsoft) | Indexul Bing | Bing Webmaster Tools, Bing Places |

Concluzia practică: dacă ești bine indexat în Google și în Bing, ai un profil Google complet și conținut clar, acoperi majoritatea asistenților.

## Ce conținut să creezi, pe domenii

Asistenții răspund la întrebări. Cele mai valoroase pagini sunt cele care răspund la întrebările pe care oamenii le pun înainte să aleagă un furnizor.

| Domeniu | Întrebări la care merită să ai pagini |
|---|---|
| Clinici stomatologice | Cât costă un implant în [oraș], cât durează, doare, ce garanție are |
| Saloane | Cât ține o manichiură semipermanentă, ce tratament e potrivit pentru părul vopsit |
| Construcții | Cât costă renovarea unui apartament pe metru pătrat, în cât timp se face, ce autorizații trebuie |
| Avocați | Cât costă un divorț, cât durează, ce acte trebuie |
| Contabili | Cât costă contabilitatea pentru un SRL, ce trebuie să trimit lunar |
| Service auto | Cât costă revizia, la câți kilometri se schimbă distribuția |

Fiecare pagină: răspunsul în prima frază, apoi detaliile, cifre concrete, experiența ta și un pas următor.

## Exemplu de date structurate, explicat

Datele structurate sunt un bloc de cod invizibil pentru vizitatori, dar citit de motoarele de căutare și de asistenți. Pentru o clinică, ar spune, în esență:

- tipul afacerii: clinică stomatologică;
- denumirea, adresa, telefonul, programul;
- zona deservită;
- serviciile, cu prețuri de la;
- nota medie și numărul de recenzii, dacă sunt afișate pe site;
- întrebările frecvente de pe pagină, cu răspunsurile lor.

Nu trebuie să le scrii tu. Furnizorul site-ului le poate genera automat din informațiile din pagini. Le verifici cu instrumentul gratuit de testare a rezultatelor îmbogățite de la Google.

## Plan pe 90 de zile

| Perioadă | Ce faci |
|---|---|
| Zilele 1 până la 15 | Verifici robots.txt, indexarea în Google și Bing, Google Business Profile, Bing Places |
| Zilele 15 până la 30 | Adaugi date structurate și llms.txt, corectezi datele firmei în directoare |
| Luna 2 | Rescrii paginile principale de servicii ca răspunsuri directe, adaugi întrebări frecvente |
| Luna 3 | Creezi 3 până la 5 pagini noi pentru întrebările cu cea mai mare valoare, ceri recenzii constant |
| Lunar | Testul celor 10 întrebări în ChatGPT, Gemini și Perplexity |

## Greșeli frecvente

- **Robots.txt care blochează crawlerele AI,** pus implicit de o temă, un plugin sau de furnizorul de găzduire.
- **Informații contradictorii:** prețuri diferite pe site și pe Facebook, program diferit în Google.
- **Pagini cu text doar în imagini sau în PDF-uri.** Asistenții le citesc greu sau deloc.
- **Lipsa paginii Despre noi și a datelor firmei.** Asistenții, ca și oamenii, au încredere în firmele identificabile.
- **Conținut fără autor și fără experiență.** Paginile cu numele specialistului și cu exemple reale sunt mai credibile.

## Studiu de caz: o clinică dintr-un oraș mediu

Să luăm un exemplu tipic. O clinică stomatologică dintr-un oraș de 150.000 de locuitori verifică întrebarea „ce clinică stomatologică îmi recomanzi în [oraș] pentru implant” în trei asistenți. Rezultatul inițial: apare doar în Gemini, pe locul patru, iar în ChatGPT și Perplexity lipsește. Concurenții citați au pagini dedicate implanturilor, cu prețuri, și sunt menționați într-un ghid al unui site local de știri.

Ce schimbă clinica în trei luni:

1. Verifică robots.txt și descoperă că tema blochează GPTBot. Îl deblochează.
2. Creează o pagină „Implant dentar în [oraș]: preț, etape, durată”, cu răspunsul în prima frază, tabel de prețuri și opt întrebări frecvente.
3. Adaugă date structurate pentru clinică, servicii și întrebări frecvente.
4. Completează profilul Google cu servicii și prețuri și pornește un proces de cerere a recenziilor după fiecare tratament încheiat.
5. Se înscrie în Bing Places și corectează adresa în trei directoare unde era greșită.
6. Medicul principal oferă un interviu pentru un site local despre prețurile implanturilor.

După trei luni, clinica apare în răspunsurile tuturor celor trei asistenți pentru întrebarea testată, iar pagina nouă e citată ca sursă în Perplexity. Rezultatele nu sunt garantate și diferă de la caz la caz, dar ordinea pașilor e cea care funcționează de obicei: întâi accesul și claritatea, apoi conținutul, apoi confirmarea din surse externe.

## Cum scrii o pagină pe care un asistent o poate cita

Structura de mai jos funcționează pentru aproape orice serviciu:

1. **Titlu sub formă de întrebare sau cu cuvintele căutate:** „Cât costă renovarea unei băi în Cluj”.
2. **Primul paragraf, răspunsul complet în două sau trei propoziții:** intervalul de preț, de ce depinde, cât durează.
3. **Un tabel cu variante:** de exemplu, renovare parțială, completă, premium, cu prețuri și durate.
4. **Pașii procesului**, numerotați.
5. **Ce influențează prețul**, ca listă.
6. **Exemple reale:** două sau trei proiecte, cu suprafață, buget și durată.
7. **Întrebări frecvente:** cinci până la opt, cu răspunsuri scurte.
8. **Cine scrie:** numele și experiența specialistului.
9. **Data actualizării**, vizibilă.
10. **Pasul următor:** buton de ofertă sau programare.

## Ce să eviți în texte

- Introduceri lungi înainte de răspuns („În zilele noastre, tot mai mulți oameni...”).
- Formulări vagi fără cifre („prețuri accesibile”, „în cel mai scurt timp”).
- Superlative fără dovezi („cei mai buni din oraș”).
- Același text pe mai multe pagini, cu orașul schimbat.
- Informații importante ascunse în imagini, slider-e sau fișiere PDF.

## Concluzie

Ca să apari în ChatGPT, Gemini și Perplexity, ai nevoie de trei lucruri: un site pe care asistenții îl pot citi, conținut care răspunde direct și concret la întrebările clienților și o prezență coerentă în afara site-ului, cu recenzii și mențiuni. Nu e un truc nou, ci SEO făcut bine, cu accent pe claritate și pe informație verificabilă.

Vrei să vezi de unde pornești? [Auditul gratuit](/audit) îți arată în 60 de secunde problemele tehnice care te pot ține în afara rezultatelor.`,
  faq: [
    ["Pot plăti ca firma mea să apară în ChatGPT?", "Nu există poziții plătite în răspunsurile organice ale asistenților AI. Apariția depinde de informațiile publice despre firma ta: site, Google Business Profile, recenzii, directoare și mențiuni în alte surse."],
    ["Ce este GEO?", "GEO (Generative Engine Optimization) este optimizarea conținutului și a prezenței online ca o firmă să fie citată sau recomandată de asistenții AI precum ChatGPT, Gemini și Perplexity. Se bazează pe principiile SEO clasice, cu accent pe răspunsuri clare și date structurate."],
    ["Trebuie să blochez sau să permit crawlerele AI?", "Dacă vrei să apari în răspunsurile asistenților, permite-le în robots.txt: GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot și Google-Extended. Blocarea lor te scoate din sursele pe care le pot folosi."],
    ["Ce este fișierul llms.txt?", "Un fișier text la rădăcina site-ului care rezumă pentru asistenții AI cine ești, ce oferi și care sunt paginile importante. Nu e un standard oficial, dar e ușor de adăugat și poate ajuta."],
    ["În cât timp apar în răspunsurile AI?", "Schimbările tehnice se pot vedea în câteva săptămâni. Conținutul nou, recenziile și mențiunile externe au efect în câteva luni, iar rezultatele nu pot fi garantate de nimeni."],
  ],
};
export default a;
