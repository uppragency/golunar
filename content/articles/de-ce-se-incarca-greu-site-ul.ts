import type { Article } from "./types";

const a: Article = {
  body: `De ce se încarcă greu site-ul tău? În majoritatea cazurilor, din cinci motive: imagini prea mari, prea multe scripturi externe (chat, reclame, pluginuri), găzduire slabă, o temă sau un constructor de site-uri încărcat cu funcții pe care nu le folosești și lipsa memoriei cache. Vestea bună: nu trebuie să fii programator ca să afli care e cauza în cazul tău.

În acest ghid vezi cum măsori viteza corect, ce înseamnă indicatorii Google (Core Web Vitals) explicați simplu, cauzele frecvente cu soluțiile lor și când merită să repari site-ul și când să-l refaci.

## De ce contează viteza

Viteza nu e un detaliu tehnic, ci o problemă de vânzări:

- **Vizitatorii pleacă.** Pe mobil, fiecare secundă în plus de așteptare crește numărul celor care închid pagina înainte să vadă ce oferi.
- **Google ține cont de ea.** Experiența pe pagină, inclusiv indicatorii Core Web Vitals, face parte din semnalele de clasare. Nu e cel mai important factor, dar între două pagini la fel de relevante, cea mai rapidă are un avantaj.
- **Reclamele costă mai mult.** În Google Ads, o pagină de destinație lentă scade scorul de calitate, deci plătești mai mult pe click.

## Cum măsori viteza corect

### PageSpeed Insights

Intră pe [pagespeed.web.dev](https://pagespeed.web.dev), introdu adresa și uită-te la două lucruri:

1. **Evaluarea Core Web Vitals** (sus): date reale de la vizitatorii tăi din ultimele 28 de zile, dacă site-ul are suficient trafic. Aceasta e cea care contează pentru Google.
2. **Scorul de performanță** (0 până la 100): un test de laborator, pe un telefon simulat cu conexiune mai lentă. Util pentru diagnostic.

Testează varianta de mobil, nu doar desktop. Majoritatea vizitatorilor vin de pe telefon, iar Google indexează după versiunea de mobil.

### Google Search Console

Raportul „Core Web Vitals” din Search Console arată toate paginile site-ului grupate în bune, de îmbunătățit și slabe. E cel mai bun punct de pornire pentru un site cu multe pagini.

### Auditul nostru gratuit

[Auditul gratuit LUNAR](/audit) rulează testul Google pe mobil și îți spune, în limbaj simplu, ce merită reparat întâi.

## Core Web Vitals, explicate simplu

Google măsoară trei lucruri, legate de ce simte vizitatorul:

| Indicator | Ce măsoară | Pe înțelesul tuturor | Prag bun |
|---|---|---|---|
| LCP (Largest Contentful Paint) | Când apare cel mai mare element vizibil | „În cât timp văd pagina?” | Sub 2,5 secunde |
| INP (Interaction to Next Paint) | Cât de repede răspunde pagina la click și atingere | „Reacționează când apăs?” | Sub 200 de milisecunde |
| CLS (Cumulative Layout Shift) | Cât de mult sar elementele în timpul încărcării | „Se mută butonul exact când vreau să apăs?” | Sub 0,1 |

INP a înlocuit vechiul indicator FID în martie 2024. Dacă citești ghiduri mai vechi care vorbesc despre FID, informația e depășită.

## Cauzele frecvente și soluțiile

### 1. Imagini prea mari

Cea mai frecventă cauză. O fotografie de 5 MB de pe telefon, pusă direct pe site, încarcă pagina mai mult decât tot restul la un loc.

**Soluție:** imagini redimensionate la mărimea la care se afișează, în format modern (WebP sau AVIF), comprimate și încărcate „leneș” (doar când ajung pe ecran), cu excepția imaginii principale de sus.

### 2. Prea multe scripturi externe

Fiecare chat, pixel de reclame, widget de recenzii, hartă, video încorporat sau font extern adaugă cereri și cod care trebuie rulat. Zece astfel de servicii pot dubla timpul de încărcare.

**Soluție:** fă inventarul și păstrează doar ce folosești. Încarcă scripturile neesențiale după ce pagina e vizibilă sau doar după acordul pentru cookie-uri. Înlocuiește videoclipurile încorporate cu o imagine care pornește videoul la click.

### 3. Găzduire slabă

Hostingul partajat foarte ieftin împarte serverul cu sute de alte site-uri. Primul răspuns al serverului (TTFB) ajunge să dureze peste o secundă, înainte ca pagina să înceapă să se încarce.

**Soluție:** găzduire de calitate, cu server aproape de vizitatori (în UE pentru România) și rețea de livrare a conținutului (CDN).

### 4. Temă sau constructor încărcat

Temele WordPress „multifuncționale” și constructorii vizuali încarcă cod pentru zeci de funcții, chiar dacă folosești două. La fel, unele platforme de tip constructor de site-uri adaugă mult cod propriu.

**Soluție:** o temă ușoară sau un site construit doar cu ce e necesar. Am comparat abordările în [LUNAR vs WordPress](/resurse/lunar-vs-wordpress) și [LUNAR vs Wix](/resurse/lunar-vs-wix).

### 5. Prea multe pluginuri

Fiecare plugin WordPress poate adăuga fișiere CSS și JavaScript pe toate paginile, chiar dacă e folosit pe una singură.

**Soluție:** dezactivează și șterge pluginurile nefolosite; înlocuiește mai multe pluginuri mici cu unul bine făcut sau cu cod simplu.

### 6. Lipsa memoriei cache

Fără cache, serverul construiește pagina de la zero pentru fiecare vizitator.

**Soluție:** cache pe server sau pagini generate dinainte (statice), plus cache în browser pentru fișierele care nu se schimbă.

### 7. Fonturi și elemente care sar

Fonturile încărcate de pe alte servere și imaginile fără dimensiuni declarate fac textul să clipească și elementele să sară (CLS mare).

**Soluție:** fonturi găzduite local, cu afișare imediată a unui font de rezervă, și dimensiuni declarate pentru imagini și reclame.

## Ce poți face singur azi

| Acțiune | Dificultate | Impact |
|---|---|---|
| Comprimă și redimensionează imaginile mari | Mică | Mare |
| Șterge pluginurile și widgeturile nefolosite | Mică | Mediu |
| Înlocuiește videoclipurile încorporate cu imagine + click | Mică | Mediu |
| Activează un plugin de cache (WordPress) | Mică | Mare |
| Mută site-ul pe o găzduire mai bună | Medie | Mare |
| Schimbă tema cu una ușoară | Mare | Mare |

> **Regula de aur** Testează după fiecare modificare, pe mobil, de două sau trei ori. Scorul variază cu câteva puncte de la un test la altul; contează tendința, nu un punct în plus sau în minus.

## Reparat sau refăcut?

Repararea are sens când problemele sunt punctuale: imagini, câteva pluginuri, cache. Refacerea are sens când:

- tema sau constructorul e cauza principală și nu poate fi schimbat fără refacere;
- site-ul e vechi, iar fiecare reparație strică altceva;
- ai nevoie oricum de design sau conținut nou;
- costul reparațiilor repetate depășește costul unui site nou.

Dacă refaci site-ul, mută-l corect, ca să nu pierzi pozițiile din Google: vezi [checklistul de migrare](/resurse/schimbi-furnizorul-web-fara-sa-pierzi-trafic) și oferta noastră de [migrare gratuită](/migrare-website).

## Cum construim site-uri rapide la LUNAR

Site-urile LUNAR sunt generate dinainte pe server, servite printr-o rețea globală, cu imagini optimizate automat și fără pluginuri. Ținta noastră e un scor PageSpeed peste 90 pe mobil la lansare. Vezi tehnologiile pe care le folosim în pagina [Tehnologii](/tehnologii).

## Cum citești raportul PageSpeed Insights

Raportul pare tehnic, dar trebuie să te uiți doar la câteva zone:

1. **Evaluarea Core Web Vitals (sus):** „Reușit” sau „Nereușit”, pe baza vizitatorilor reali. Dacă scrie că nu sunt suficiente date, site-ul are trafic mic și te bazezi pe testul de laborator.
2. **Scorul de performanță:** testul simulat. Sub 50 pe mobil e o problemă reală.
3. **Diagnosticul:** lista de probleme, ordonată după impact. Primele trei sau patru rânduri spun aproape întotdeauna povestea: „Redimensionează corect imaginile”, „Reduce JavaScriptul neutilizat”, „Elimină resursele care blochează redarea”, „Reduce timpul de răspuns inițial al serverului”.
4. **Elementul LCP:** raportul îți arată exact ce element e „cel mai mare” și cât a durat să apară. De obicei e imaginea principală sau titlul de sus.

| Mesaj din raport | Ce înseamnă pe românește | Soluția tipică |
|---|---|---|
| Redimensionează corect imaginile | Imaginile sunt mai mari decât sunt afișate | Imagini la mărimea reală, format WebP sau AVIF |
| Reduce JavaScriptul neutilizat | Se încarcă cod care nu e folosit pe pagină | Mai puține pluginuri și scripturi externe |
| Elimină resursele care blochează redarea | Pagina așteaptă fișiere înainte să afișeze ceva | Încărcarea amânată a scripturilor și stilurilor neesențiale |
| Reduce timpul de răspuns inițial al serverului | Serverul răspunde greu | Găzduire mai bună, cache |
| Evită schimbările mari de aspect | Elemente care sar la încărcare | Dimensiuni declarate pentru imagini, fonturi locale |

## Exemplu: înainte și după

Un site de prezentare tipic, construit cu o temă multifuncțională și 25 de pluginuri:

| Indicator | Înainte | După optimizare |
|---|---|---|
| Scor mobil PageSpeed | 34 | 78 |
| LCP pe mobil | 6,8 secunde | 2,4 secunde |
| Dimensiunea paginii | 6,2 MB | 1,1 MB |
| Cereri către server | 142 | 48 |

Ce s-a făcut: imaginile comprimate și convertite, 11 pluginuri eliminate, chat-ul încărcat doar după 5 secunde, cache activat. Pentru a trece de 90, ar fi fost nevoie de o temă mai ușoară sau de refacerea site-ului.

## Checklist de trimis dezvoltatorului

Dacă lucrezi cu cineva care se ocupă de site, trimite-i lista:

1. Imagini redimensionate, în WebP sau AVIF, cu încărcare amânată, mai puțin imaginea principală.
2. Imaginea principală de sus preîncărcată și fără încărcare amânată.
3. Scripturile externe (chat, pixeli, hărți, video) încărcate după afișarea paginii sau după consimțământ.
4. Fonturi găzduite local, cu font de rezervă afișat imediat.
5. Cache pe server și în browser, plus CDN.
6. Pluginuri nefolosite eliminate.
7. Dimensiuni declarate pentru toate imaginile și blocurile de reclamă.
8. Test pe mobil în PageSpeed Insights înainte și după, cu capturile de ecran.

## Viteza și conversiile

Un site mai rapid nu aduce doar poziții mai bune. Aduce mai multe cereri din același trafic. Dacă plătești reclame, fiecare vizitator care pleacă înainte să vadă pagina e un click plătit degeaba. De aceea, viteza merită verificată înainte de orice campanie Google Ads sau Facebook. Vezi și [Google Ads pentru firme mici](/resurse/google-ads-pentru-firme-mici).

## Cât de des să verifici viteza

Viteza nu se repară o dată pentru totdeauna. Fiecare plugin nou, fiecare imagine încărcată fără compresie și fiecare script adăugat pentru o campanie o pot strica. Verifică:

- **lunar**, raportul Core Web Vitals din Search Console;
- **după orice modificare importantă** (temă nouă, plugin nou, widget nou), un test în PageSpeed Insights;
- **înainte de orice campanie plătită**, pagina pe care trimiți traficul.

## Concluzie

Un site lent pierde vizitatori, poziții în Google și bani din reclame. Cele mai multe cauze se găsesc în cinci locuri: imagini, scripturi externe, găzduire, temă și cache. Măsoară cu PageSpeed Insights pe mobil, rezolvă întâi ce are impact mare și efort mic, iar dacă problema e chiar fundația site-ului, ia în calcul refacerea.

Află în 60 de secunde unde ești: [auditul gratuit](/audit) îți arată viteza pe mobil și primele lucruri de reparat.`,
  faq: [
    ["Cum verific viteza site-ului meu?", "Cu PageSpeed Insights (pagespeed.web.dev), pe varianta de mobil. Uită-te la evaluarea Core Web Vitals, bazată pe vizitatori reali, și la scorul de performanță pentru diagnostic. Raportul Core Web Vitals din Google Search Console arată toate paginile."],
    ["Ce scor PageSpeed este bun?", "Un scor peste 90 e foarte bun, între 50 și 89 e de îmbunătățit, sub 50 e slab. Mai important decât scorul este ca indicatorii Core Web Vitals reali să fie în zona verde."],
    ["Viteza site-ului influențează poziția în Google?", "Da, prin semnalele de experiență pe pagină, inclusiv Core Web Vitals. Relevanța conținutului rămâne mai importantă, dar între pagini la fel de relevante, viteza poate face diferența."],
    ["De ce site-ul meu e rapid pe calculator, dar lent pe telefon?", "Telefoanele au procesoare mai slabe și conexiuni mai variabile. Imaginile mari și scripturile multe afectează mult mai tare mobilul. Testează întotdeauna varianta de mobil."],
    ["Cât costă să fac site-ul mai rapid?", "Optimizările simple (imagini, cache, pluginuri) pot fi făcute în câteva ore. Dacă tema sau platforma sunt cauza, refacerea site-ului poate fi mai ieftină decât reparațiile repetate."],
  ],
};
export default a;
