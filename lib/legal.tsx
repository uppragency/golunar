/* Textele legale LUNAR. Ultima actualizare: 20 noiembrie 2026. */

export const LEGAL_UPDATED = "20 noiembrie 2026";

const OP = "UPPRMARKETING S.R.L., cu sediul în Sat Chiajna, Com. Chiajna, Str. Sergent Ilie Petre Nr. 84, Bl. 1, Et. 7, Ap. 716, Județ Ilfov, CIF 52762670, Reg. com. J2025081624004";

export const LEGAL: Record<string, { title: string; lede: string; description: string; body: React.ReactNode }> = {
  termeni: {
    title: "Termeni și condiții · Contract-cadru",
    lede: "Condițiile abonamentului LUNAR: ce primești, cât plătești, cum devine website-ul al tău și cum poți opri abonamentul.",
    description: "Contractul-cadru LUNAR: abonament lunar pentru website, perioade minime, proprietate după 12 plăți, garanția de lansare, plată și anulare.",
    body: (
      <>
        <h2>1. Părțile și obiectul contractului</h2>
        <p>LUNAR este un serviciu oferit de {OP} („LUNAR”, „noi”). Clientul („tu”) este persoana juridică sau profesionistul care plasează o comandă pe golunar.ro.</p>
        <p>Obiectul contractului este realizarea, găzduirea, întreținerea și îmbunătățirea lunară a unui website personalizat, în schimbul unui abonament lunar, conform planului ales la comandă. Serviciul se adresează exclusiv profesioniștilor: plasând comanda, confirmi că acționezi în numele unei persoane juridice sau al unei activități profesionale autorizate. Prevederile privind dreptul de retragere al consumatorilor nu se aplică.</p>

        <h2>2. Încheierea contractului</h2>
        <p>Contractul se încheie la data la care accepți acești termeni în formularul de comandă și trimiți comanda. Primești pe email confirmarea comenzii, numărul de referință (LNR-xxxx) și datele de plată. Serviciile încep după încasarea primei rate.</p>
        <p>Ne rezervăm dreptul de a refuza o comandă, cu informarea ta, de exemplu dacă datele firmei sunt incorecte sau activitatea este ilegală. În acest caz nu datorezi nicio sumă.</p>

        <h2>3. Ce include abonamentul</h2>
        <ul>
          <li>design și dezvoltare website personalizat, fără taxă separată de creare;</li>
          <li>domeniu, găzduire, certificat SSL, backup zilnic și monitorizare a disponibilității;</li>
          <li>mentenanță tehnică, actualizări de securitate și suport prin portalul de client;</li>
          <li>un număr de îmbunătățiri lunare, în funcție de plan: Esențial 1, Creștere 2, Partener 4;</li>
          <li>funcțiile suplimentare ale planului ales, descrise pe golunar.ro la data comenzii;</li>
          <li>opțiunile suplimentare comandate (de exemplu identitate vizuală, vizibilitate locală Google, limbă suplimentară).</li>
        </ul>
        <p>O îmbunătățire este o modificare delimitată, de până la aproximativ 2 ore de lucru: conținut, o secțiune nouă, o ajustare de navigare sau o integrare. Cererile mai mari se împart în mai multe îmbunătățiri, cu acordul tău. Îmbunătățirile nefolosite într-o lună nu se reportează. Răspundem la cereri în cel mult 48 de ore lucrătoare.</p>

        <h2>4. Lansarea și garanția de lansare</h2>
        <p>Lansăm website-ul în 10 zile lucrătoare de la data la care primim brief-ul complet prin portalul de client. Zilele în care așteptăm de la tine materiale, răspunsuri sau aprobări nu se numără.</p>
        <p>Dacă depășim termenul de 10 zile lucrătoare din motive care ne aparțin, rata lunară următoare este gratuită. Aceasta este singura compensație pentru întârziere: nu returnăm sume deja plătite. La plata anuală, compensația este o lună suplimentară de găzduire, mentenanță și îmbunătățiri, adăugată după cele 12 luni plătite.</p>
        <p>Îți trimitem propunerea de design spre aprobare în portal. Aprobarea ta pornește dezvoltarea. Modificările cerute după aprobarea finală se tratează ca îmbunătățiri lunare.</p>

        <h2>5. Prețuri, plată și facturare</h2>
        <p>Prețurile sunt cele afișate pe golunar.ro la data comenzii și sunt prețuri finale, fără TVA adăugat la factură. Prețul lunar al abonamentului tău rămâne cel din momentul comenzii pe toată perioada primelor 12 luni.</p>
        <p>Prima rată se plătește la comandă, iar următoarele lunar, la scadențele afișate în portal. Plata se face prin transfer bancar în contul UPPRMARKETING S.R.L. indicat în portal și pe email, cu referința comenzii. Pentru fiecare plată emitem factură fiscală.</p>
        <p>Codurile de reducere și ofertele promoționale (de exemplu prima lună la 4,99 lei pe planul Esențial, pentru clienți noi) se aplică doar în condițiile afișate pentru fiecare cod, nu se cumulează și nu se pot transforma în bani.</p>
        <p>Poți alege și plata anuală: plătești o singură dată 12 luni de abonament, cu reducerea afișată la comandă (în prezent 20%). Plata anuală nu se cumulează cu alte coduri de reducere sau oferte, iar suma plătită nu se returnează în caz de anulare.</p>
        <p>O comandă neplătită în 10 zile de la plasare se anulează automat, fără costuri.</p>

        <h2>6. Întârzieri la plată</h2>
        <p>Dacă o rată nu este plătită la scadență, te anunțăm pe email. După 14 zile de la scadență putem suspenda temporar website-ul și serviciile, până la plata sumelor restante. Suspendarea nu oprește calculul ratelor și nu prelungește perioada până la proprietate.</p>

        <h2>7. Perioada minimă și anularea</h2>
        <p>Fiecare plan are o perioadă minimă: 3 luni pentru Esențial, 2 luni pentru Creștere și o lună pentru Partener. După perioada minimă poți anula oricând din portalul de client (secțiunea Contract și documente), cu indicarea motivului. Abonamentul se oprește înainte de următoarea rată, iar sumele deja plătite nu se returnează.</p>
        <p>Dacă anulezi înainte de 12 plăți, poți alege între:</p>
        <ul>
          <li>renunțarea la website, fără alte costuri, caz în care site-ul și găzduirea se opresc la finalul perioadei plătite;</li>
          <li>preluarea website-ului, prin plata ratelor rămase până la 12, la valoarea lunară curentă.</li>
        </ul>
        <p>Putem rezilia contractul cu notificare de 30 de zile sau imediat în caz de încălcare gravă a acestor termeni (de exemplu conținut ilegal sau neplata repetată).</p>

        <h2>8. Proprietatea asupra website-ului</h2>
        <p>Domeniul este înregistrat pe numele firmei tale din prima zi. Website-ul (designul și conținutul creat pentru tine) devine proprietatea ta după 12 plăți lunare și încheierea primei perioade de 12 luni. La plata anuală, website-ul devine proprietatea ta după confirmarea plății integrale a celor 12 luni. La transfer primești un proces-verbal de predare și, la cerere, codul-sursă și fișierele, în cel mult 15 zile lucrătoare.</p>
        <p>Componentele terțe (fonturi, biblioteci, imagini licențiate, servicii externe) rămân sub licențele proprii. Până la transfer, LUNAR păstrează drepturile asupra designului și codului, iar tu ai drept de utilizare pe durata abonamentului.</p>
        <p>După transfer poți continua cu LUNAR pentru găzduire, mentenanță și îmbunătățiri, la prețul comunicat atunci, sau poți muta website-ul la alt furnizor.</p>

        <h2>9. Obligațiile tale</h2>
        <ul>
          <li>să furnizezi informații corecte despre firmă și materialele necesare (texte, imagini, logo);</li>
          <li>să deții drepturile asupra materialelor pe care ni le trimiți și să nu soliciți conținut ilegal, înșelător sau care încalcă drepturile altora;</li>
          <li>să plătești ratele la scadență;</li>
          <li>să păstrezi confidențialitatea datelor de acces la portal.</li>
        </ul>

        <h2>10. Răspundere</h2>
        <p>Depunem toate eforturile rezonabile pentru funcționarea continuă a website-ului, dar nu garantăm o disponibilitate de 100%, poziții în Google, un anumit trafic sau mențiuni în răspunsurile sistemelor AI. Nu răspundem pentru pierderi indirecte (profit nerealizat, oportunități pierdute) și nici pentru întreruperi cauzate de furnizori terți sau de forță majoră. Răspunderea totală a LUNAR este limitată la valoarea plătită de tine în ultimele 3 luni.</p>

        <h2>11. Date personale</h2>
        <p>Prelucrăm datele tale conform <a className="inl" href="/legal/confidentialitate">Politicii de confidențialitate</a>. Pentru datele vizitatorilor website-ului tău (de exemplu mesajele din formulare), tu ești operator, iar LUNAR acționează ca persoană împuternicită, conform acordului de prelucrare a datelor disponibil în portal.</p>

        <h2>12. Modificarea termenilor</h2>
        <p>Putem actualiza acești termeni. Te anunțăm pe email cu cel puțin 30 de zile înainte de orice modificare care te afectează. Prețul abonamentului tău nu se modifică în primele 12 luni.</p>

        <h2>13. Litigii și legea aplicabilă</h2>
        <p>Contractul este guvernat de legea română. Încercăm întâi să rezolvăm orice neînțelegere pe cale amiabilă, la hello@golunar.ro. În lipsa unei înțelegeri, litigiile se soluționează de instanțele competente de la sediul LUNAR.</p>

        <h2>14. Contact</h2>
        <p>Pentru orice întrebare despre acest contract: <a className="inl" href="mailto:hello@golunar.ro">hello@golunar.ro</a>.</p>
      </>
    ),
  },

  confidentialitate: {
    title: "Politica de confidențialitate",
    lede: "Ce date colectăm, de ce, cât timp le păstrăm și ce drepturi ai.",
    description: "Politica de confidențialitate LUNAR (UPPRMARKETING S.R.L.): ce date personale prelucrăm, temeiul legal, destinatarii, durata păstrării și drepturile tale GDPR.",
    body: (
      <>
        <h2>1. Cine suntem</h2>
        <p>Operatorul datelor este {OP}, care oferă serviciul LUNAR pe golunar.ro. Pentru orice întrebare despre datele tale ne scrii la <a className="inl" href="mailto:hello@golunar.ro">hello@golunar.ro</a>.</p>

        <h2>2. Ce date prelucrăm</h2>
        <ul>
          <li><b>Date de comandă și cont:</b> numele firmei, CUI, număr de înregistrare, adresă, numele reprezentantului și al persoanei de contact, email, telefon, plan ales, istoricul plăților.</li>
          <li><b>Date din brief și cereri:</b> informațiile despre afacere, textele, imaginile și fișierele pe care le încarci în portal.</li>
          <li><b>Date din formulare:</b> numele, emailul, telefonul și mesajul trimise prin formularul de discuție gratuită, formularul de contact sau auditul gratuit (inclusiv adresa website-ului analizat).</li>
          <li><b>Comenzi începute:</b> emailul, numele și alegerile din formularul de comandă, salvate când introduci emailul, ca să îți putem trimite cel mult două amintiri dacă nu finalizezi comanda.</li>
          <li><b>Date tehnice:</b> adresa IP, tipul de browser și dispozitiv, paginile vizitate, sursa vizitei (de exemplu Google sau o campanie), în condițiile din <a className="inl" href="/legal/cookies">Politica de cookie-uri</a>.</li>
          <li><b>Comunicări:</b> emailurile trimise și primite, inclusiv starea livrării.</li>
        </ul>

        <h2>3. De ce le folosim și pe ce temei</h2>
        <ul>
          <li><b>Încheierea și executarea contractului</b> (art. 6 alin. 1 lit. b GDPR): procesarea comenzii, crearea și întreținerea website-ului, portalul de client, suportul, emailurile despre comandă, lansare și plăți.</li>
          <li><b>Obligații legale</b> (lit. c): facturare, contabilitate, arhivare fiscală.</li>
          <li><b>Interes legitim</b> (lit. f): securitatea serviciului, prevenirea fraudei, răspunsul la solicitări trimise prin formulare, îmbunătățirea serviciului, recuperarea creanțelor, programul de recomandare și cel mult două amintiri despre o comandă începută și netrimisă.</li>
          <li><b>Consimțământ</b> (lit. a): cookie-urile de analiză și marketing și emailurile de prezentare (cel mult 5, în 14 zile), trimise doar dacă bifezi opțiunea din formular. Îți poți retrage consimțământul oricând, din linkul de dezabonare din fiecare email.</li>
        </ul>

        <h2>4. Cui transmitem datele</h2>
        <p>Nu vindem datele. Le transmitem doar furnizorilor care ne ajută să livrăm serviciul, pe bază de contract și cu garanții de protecție:</p>
        <ul>
          <li>Supabase (bază de date, autentificare, stocare fișiere);</li>
          <li>Vercel (găzduirea golunar.ro și a website-urilor clienților);</li>
          <li>Resend (trimiterea emailurilor);</li>
          <li>Sentry (monitorizarea erorilor tehnice, cu date stocate în UE și fără conținutul formularelor, cookie-uri sau adrese IP);</li>
          <li>Google (Tag Manager, Analytics, Ads, PageSpeed), doar cu consimțământul tău pentru analiză și marketing;</li>
          <li>banca și, când este cazul, furnizorul de facturare electronică și ANAF (e-Factura);</li>
          <li>contabilul și consultanții noștri, autorități, când legea o cere.</li>
        </ul>
        <p>Unii furnizori pot prelucra date în afara Spațiului Economic European. În aceste cazuri, transferul se face pe baza clauzelor contractuale standard aprobate de Comisia Europeană sau a altor garanții prevăzute de GDPR.</p>

        <h2>5. Cât timp păstrăm datele</h2>
        <ul>
          <li>datele de cont și contract: pe durata contractului și 3 ani după încetarea lui;</li>
          <li>documentele financiar-contabile: 5 ani, conform legii;</li>
          <li>lead-urile din formulare care nu devin clienți: cel mult 2 ani de la ultimul contact;</li>
          <li>fișierele din brief: pe durata contractului, apoi se șterg sau se predau la transferul proprietății;</li>
          <li>datele din cookie-uri: conform duratelor din Politica de cookie-uri.</li>
        </ul>

        <h2>6. Drepturile tale</h2>
        <p>Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și dreptul de a-ți retrage consimțământul. Ne scrii la hello@golunar.ro și răspundem în cel mult 30 de zile. Ai și dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), www.dataprotection.ro.</p>

        <h2>7. Datele vizitatorilor website-urilor clienților</h2>
        <p>Pentru datele colectate pe website-urile create pentru clienții noștri (de exemplu formulare de contact sau programări), clientul este operator, iar LUNAR este persoană împuternicită și prelucrează datele doar conform instrucțiunilor clientului și acordului de prelucrare a datelor.</p>

        <h2>8. Securitate</h2>
        <p>Folosim conexiuni criptate (HTTPS), acces pe bază de cont și roluri, reguli de acces la nivel de rând în baza de date, copii de siguranță zilnice și monitorizare. Niciun sistem nu este complet sigur, dar te anunțăm fără întârziere dacă o încălcare a securității îți poate afecta datele.</p>

        <h2>9. Modificări</h2>
        <p>Putem actualiza această politică. Versiunea curentă este publicată pe această pagină, cu data ultimei actualizări.</p>
      </>
    ),
  },

  cookies: {
    title: "Politica de cookie-uri",
    lede: "Ce cookie-uri folosește golunar.ro, de ce, și cum îți schimbi alegerea.",
    description: "Politica de cookie-uri golunar.ro: cookie-uri necesare, funcționale, de analiză și marketing, durate și cum îți gestionezi consimțământul.",
    body: (
      <>
        <h2>1. Ce sunt cookie-urile</h2>
        <p>Cookie-urile sunt fișiere mici salvate în browser când vizitezi un site. Folosim și tehnologii similare, cum ar fi spațiul de stocare local al browserului. În această politică le numim pe toate „cookie-uri”.</p>

        <h2>2. Cum îți dai sau retragi acordul</h2>
        <p>La prima vizită îți cerem acordul pentru cookie-urile de analiză și marketing, prin bannerul „Accept / Refuz”. Fără acord, acestea nu se activează. Îți poți schimba oricând alegerea din linkul <b>Preferințe cookie</b> din subsolul oricărei pagini. Folosim Google Consent Mode: până la acord, serviciile Google funcționează fără cookie-uri de analiză sau reclame.</p>

        <h2>3. Ce cookie-uri folosim</h2>
        <h3>Necesare (fără acord, sunt indispensabile funcționării)</h3>
        <ul>
          <li><b>sb-…-auth-token</b> (Supabase): autentificarea în portalul de client și în admin. Durată: sesiunea de autentificare.</li>
          <li><b>lunar-consent</b> (stocare locală): ține minte alegerea ta privind cookie-urile. Durată: până o ștergi.</li>
          <li><b>lunar_company</b>: folosit doar de echipa LUNAR în admin. Durată: 8 ore.</li>
        </ul>
        <h3>Funcționale</h3>
        <ul>
          <li><b>lunar_ref</b>: păstrează codul de recomandare când intri pe un link primit de la un client LUNAR, ca recomandarea să fie atribuită corect. Durată: 90 de zile.</li>
          <li><b>lunar_cur</b> (stocare locală): moneda aleasă, lei sau euro. Durată: până o ștergi.</li>
        </ul>
        <h3>Analiză și marketing (doar cu acordul tău)</h3>
        <ul>
          <li><b>lunar_src</b>: sursa primei vizite (de exemplu Google, Facebook sau o campanie), ca să știm ce canale aduc clienți. Durată: 90 de zile.</li>
          <li><b>Google Tag Manager, Google Analytics 4</b> (_ga, _ga_*): statistici despre vizite. Durată: până la 2 ani.</li>
          <li><b>Google Ads</b> (_gcl_*): măsurarea conversiilor din reclame. Durată: până la 90 de zile.</li>
          <li><b>Meta Pixel</b> (_fbp), dacă este activat: măsurarea campaniilor Facebook și Instagram. Durată: până la 90 de zile.</li>
        </ul>
        <p>Folosim și Vercel Web Analytics, care măsoară vizitele fără cookie-uri și fără date care te identifică, și Sentry, care ne anunță erorile tehnice ale site-ului fără să plaseze cookie-uri.</p>

        <h2>4. Cum ștergi cookie-urile</h2>
        <p>Poți șterge sau bloca cookie-urile din setările browserului. Dacă blochezi cookie-urile necesare, autentificarea în portal nu va funcționa.</p>

        <h2>5. Mai multe informații</h2>
        <p>Detalii despre modul în care prelucrăm datele găsești în <a className="inl" href="/legal/confidentialitate">Politica de confidențialitate</a>. Pentru întrebări: <a className="inl" href="mailto:hello@golunar.ro">hello@golunar.ro</a>.</p>
      </>
    ),
  },
};
