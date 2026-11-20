import "server-only";
import { SITE_URL } from "@/lib/env";
import { layout, esc } from "@/lib/email";
import { ADDONS, PLANS, annualTotal, cartLines, type Cart, type Currency, type PlanCode } from "@/lib/plans";
import { LAUNCH } from "@/lib/discount";
import { money } from "@/lib/format";

export type GrowthJob = {
  kind: "recover_1" | "recover_2" | "nurture_1" | "nurture_2" | "nurture_3" | "nurture_4" | "nurture_5";
  email: string; name?: string | null; plan?: PlanCode | null; cart?: Cart | null; currency?: Currency | null; billing?: string | null;
};

const p = (s: string) => `<p style="margin:0 0 14px">${s}</p>`;
const li = (items: string[]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 16px">${items
    .map((x) => `<tr><td valign="top" style="padding:6px 10px 6px 0;color:#FF5B1F;width:14px">&#9679;</td><td style="padding:6px 0;color:#C4C4CA">${x}</td></tr>`)
    .join("")}</table>`;
const row = (k: string, v: string) =>
  `<tr><td style="padding:9px 0;border-top:1px solid #232327;color:#8C8C93">${esc(k)}</td><td align="right" style="padding:9px 0;border-top:1px solid #232327;color:#F5F5F6;font-weight:500">${esc(v)}</td></tr>`;
const first = (name?: string | null) => (name || "").trim().split(/\s+/)[0] || "";
const hi = (name?: string | null) => (first(name) ? `Bună, ${esc(first(name))},` : "Bună,");
const utm = (c: string) => `utm_source=email&utm_medium=lifecycle&utm_campaign=${c}`;

/** Link care redeschide comanda cu aceleași alegeri. */
function resumeUrl(j: GrowthJob, c: string) {
  const cart = j.cart ?? { plan: j.plan ?? "essential", brand: false, local: false, langs: 0 };
  const q = new URLSearchParams({ comanda: "1", plan: cart.plan });
  if (cart.brand) q.set("brand", "1");
  if (cart.local) q.set("local", "1");
  if (cart.langs) q.set("limbi", String(cart.langs));
  if (j.billing === "annual") q.set("anual", "1");
  if (j.currency === "EUR") q.set("moneda", "EUR");
  return `${SITE_URL}/?${q}&${utm(c)}`;
}

function summary(j: GrowthJob) {
  const cart = j.cart ?? { plan: j.plan ?? "essential", brand: false, local: false, langs: 0 };
  const cur = j.currency ?? "RON";
  const { net } = cartLines(cart, cur);
  const extras = [cart.brand && ADDONS.brand.name, cart.local && ADDONS.local.name, cart.langs > 0 && `${cart.langs} ${cart.langs > 1 ? "limbi suplimentare" : "limbă suplimentară"}`].filter(Boolean) as string[];
  const promo = cart.plan === "essential" && j.billing !== "annual";
  const today = j.billing === "annual" ? annualTotal(cart, cur).total : promo ? (cur === "EUR" ? LAUNCH.eur : LAUNCH.ron) + net - PLANS.essential[cur === "EUR" ? "eur" : "ron"] : net;
  const rows =
    row("Plan", PLANS[cart.plan].name + (j.billing === "annual" ? " · plată anuală" : "")) +
    (extras.length ? row("Opțiuni", extras.join(", ")) : "") +
    row(j.billing === "annual" ? "Total 12 luni" : "Azi plătești", money(today, cur, 2)) +
    (j.billing === "annual" ? "" : row("Apoi, lunar", money(net, cur)));
  return { cart, promo, table: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin:6px 0 18px">${rows}</table>` };
}

/** Emailurile de recuperare și secvența de nurturing (5 emailuri în 14 zile). */
export function renderGrowth(j: GrowthJob, unsubPage: string): { subject: string; html: string } {
  const foot = `Primești acest email pentru că ai cerut un audit, o discuție sau ai început o comandă pe golunar.ro. <a href="${unsubPage}" style="color:#8C8C93">Dezabonează-te</a> și nu mai primești emailuri de la noi.`;
  const order = `${SITE_URL}/?comanda=1&plan=essential&${utm("nurture")}`;

  switch (j.kind) {
    case "recover_1": {
      const s = summary(j);
      return {
        subject: "Comanda ta LUNAR a rămas deschisă",
        html: layout({
          preheader: "Am păstrat alegerile tale. O finalizezi în sub două minute.",
          title: "Ți-am păstrat comanda.", titleDim: "O reiei de unde ai rămas.", eyebrow: "Comandă în așteptare",
          body: p(`${hi(j.name)} ai început comanda pentru website-ul firmei, dar nu ai trimis-o. Am păstrat alegerile tale:`) + s.table +
            p("Datele firmei se completează automat din CUI. Lansarea durează 10 zile lucrătoare de la brief, iar dacă întârziem, luna următoare e gratuită.") +
            p("Ai o întrebare înainte să comanzi? Răspunde la acest email și îți scriem noi."),
          cta: "Finalizează comanda", ctaUrl: resumeUrl(j, "recover_1"), foot,
        }),
      };
    }
    case "recover_2": {
      const s = summary(j);
      return {
        subject: s.promo ? "Prima lună la 4,99 lei te așteaptă" : "Website-ul firmei tale poate fi online în 10 zile",
        html: layout({
          preheader: "Fără taxă de creare. Al tău după 12 plăți.",
          title: s.promo ? "Prima lună costă 4,99 lei." : "Online în 10 zile lucrătoare.", titleDim: "Comanda ta e încă salvată.", eyebrow: "Comandă în așteptare",
          body: p(`${hi(j.name)} revin cu răspunsurile la întrebările pe care ni le pun cei mai mulți înainte să comande:`) +
            li([
              "<strong style=\"color:#F5F5F6\">Fără taxă de creare.</strong> Designul și dezvoltarea sunt incluse în abonament.",
              "<strong style=\"color:#F5F5F6\">Website-ul devine al tău</strong> după 12 plăți. Domeniul e al tău din prima zi.",
              `<strong style="color:#F5F5F6">Perioadă minimă scurtă:</strong> ${PLANS[s.cart.plan].minMonths === 1 ? "o lună" : `${PLANS[s.cart.plan].minMonths} luni`}, apoi anulezi oricând.`,
              "<strong style=\"color:#F5F5F6\">Garanție de lansare:</strong> dacă depășim 10 zile lucrătoare, luna următoare e gratuită.",
            ]) + s.table,
          cta: "Reia comanda", ctaUrl: resumeUrl(j, "recover_2"), foot,
        }),
      };
    }
    case "nurture_1":
      return {
        subject: "Cum arată un website LUNAR, din prima zi până la lansare",
        html: layout({
          preheader: "Brief, design, dezvoltare, lansare. 10 zile lucrătoare.",
          title: "10 zile lucrătoare.", titleDim: "De la brief la site online.", eyebrow: "Cum lucrăm",
          body: p(`${hi(j.name)} mulțumim pentru interes. Pe scurt, așa decurge un proiect LUNAR:`) +
            li([
              "<strong style=\"color:#F5F5F6\">Ziua 1 · Brief.</strong> Completezi un formular de 15 minute: ce faci, pentru cine, ce vrei să obții.",
              "<strong style=\"color:#F5F5F6\">Ziua 4 · Design.</strong> Primești designul în portal și îl aprobi sau ceri modificări.",
              "<strong style=\"color:#F5F5F6\">Ziua 7 · Dezvoltare.</strong> Construim site-ul rapid, optimizat pentru Google și pentru telefon.",
              "<strong style=\"color:#F5F5F6\">Ziua 10 · Lansare.</strong> Site-ul e online pe domeniul tău, cu SSL, backup și monitorizare.",
            ]) +
            p("După lansare, site-ul se îmbunătățește în fiecare lună, prin cererile incluse în abonament. Vezi ce am construit pentru alte firme:"),
          cta: "Vezi portofoliul", ctaUrl: `${SITE_URL}/portofoliu?${utm("nurture_1")}`, foot,
        }),
      };
    case "nurture_2":
      return {
        subject: "Cât costă de fapt un website pe 3 ani",
        html: layout({
          preheader: "Prețul de creare e doar începutul. Am făcut calculul complet.",
          title: "Prețul de creare", titleDim: "e doar începutul.", eyebrow: "Costul real",
          body: p(`${hi(j.name)} la un site plătit o dată, factura nu se oprește la lansare. Pe 3 ani se adaugă:`) +
            li(["hosting și domeniu, plătite anual;", "mentenanță, actualizări și backup;", "fiecare modificare, facturată separat;", "refacerea parțială când designul se învechește."]) +
            p("La LUNAR, toate acestea sunt în abonament, iar după 12 plăți site-ul devine al tău. Am pus calculul complet, cu un instrument în care îți introduci propriile cifre:"),
          cta: "Calculează costul real", ctaUrl: `${SITE_URL}/resurse/abonament-vs-plata-unica?${utm("nurture_2")}`, foot,
        }),
      };
    case "nurture_3":
      return {
        subject: "5 întrebări pe care ni le pune aproape toată lumea",
        html: layout({
          preheader: "Proprietate, anulare, facturare, garanție. Răspunsuri scurte.",
          title: "Răspunsuri scurte", titleDim: "la întrebările frecvente.", eyebrow: "Întrebări frecvente",
          body: p(`${hi(j.name)} acestea sunt întrebările care apar cel mai des înainte de comandă:`) +
            li([
              "<strong style=\"color:#F5F5F6\">Există taxă de creare?</strong> Nu. Plătești doar abonamentul lunar.",
              "<strong style=\"color:#F5F5F6\">Când devine site-ul al meu?</strong> După 12 plăți. Domeniul e al tău din prima zi.",
              "<strong style=\"color:#F5F5F6\">Pot anula?</strong> Da, după perioada minimă a planului, cu efect la finalul lunii plătite.",
              "<strong style=\"color:#F5F5F6\">Primesc factură?</strong> Da, factură fiscală pe CUI-ul firmei, pentru fiecare plată.",
              "<strong style=\"color:#F5F5F6\">Dacă întârziați?</strong> Peste 10 zile lucrătoare, luna următoare e gratuită.",
            ]) + p("Restul răspunsurilor sunt pe o singură pagină:"),
          cta: "Toate întrebările", ctaUrl: `${SITE_URL}/intrebari-frecvente?${utm("nurture_3")}`, foot,
        }),
      };
    case "nurture_4":
      return {
        subject: "Ai deja un site? Îl mutăm gratuit",
        html: layout({
          preheader: "Preluăm conținutul și păstrăm traficul din Google.",
          title: "Ai deja un site?", titleDim: "Îl mutăm gratuit.", eyebrow: "Migrare gratuită",
          body: p(`${hi(j.name)} mulți dintre clienții noștri aveau deja un site pe WordPress, Wix sau construit de un freelancer. Mutarea la LUNAR e inclusă:`) +
            li([
              "preluăm textele, imaginile și paginile importante;",
              "facem redirecturi de pe adresele vechi, ca să nu pierzi pozițiile din Google;",
              "mutăm domeniul fără întrerupere și fără emailuri pierdute;",
              "noul site e gata în 10 zile lucrătoare, ca orice proiect LUNAR.",
            ]) + p("Nu știi în ce stare e site-ul actual? Rulează auditul gratuit, durează un minut."),
          cta: "Vezi oferta de migrare", ctaUrl: `${SITE_URL}/migrare-website?${utm("nurture_4")}`, foot,
        }),
      };
    case "nurture_5":
      return {
        subject: "Ultimul email din serie: prima lună la 4,99 lei",
        html: layout({
          preheader: "Codul GOLUNAR se aplică automat pe planul Esențial.",
          title: "Prima lună la 4,99 lei.", titleDim: "Apoi 269 lei pe lună.", eyebrow: "Ofertă de lansare",
          body: p(`${hi(j.name)} dacă vrei să începi, oferta de lansare e încă activă: prima lună pe planul Esențial costă 4,99 lei, cu codul GOLUNAR aplicat automat.`) +
            li(["website personalizat, domeniu, hosting și SSL;", "o îmbunătățire inclusă în fiecare lună;", "lansare în 10 zile lucrătoare, garantată;", "al tău după 12 plăți."]) +
            p("Acesta e ultimul email din serie. Nu te mai contactăm decât dacă ne scrii tu."),
          cta: "Comandă cu 4,99 lei", ctaUrl: order, foot,
        }),
      };
  }
}
