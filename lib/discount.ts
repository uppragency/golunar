import { ADDONS, PLANS, cartLines, round2, type Cart, type Currency, type PlanCode } from "@/lib/plans";

/** Reducere validată (răspunsul RPC check_discount). */
export type Discount = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  percent: number | null;
  amount_ron: number | null;
  amount_eur: number | null;
  months: number;
  description: string | null;
};

/** Valoarea reducerii pentru o lună cu totalul `monthly`. Nu coboară sub 0. */
export function discountFor(d: Discount | null, monthly: number, cur: Currency) {
  if (!d) return 0;
  const raw = d.kind === "percent" ? (monthly * (d.percent ?? 0)) / 100 : (cur === "EUR" ? d.amount_eur : d.amount_ron) ?? 0;
  return round2(Math.min(monthly, raw));
}

export const discountLabel = (d: Discount, cur: Currency) =>
  `${d.kind === "percent" ? `−${Number(d.percent).toLocaleString("ro-RO")}%` : `−${(cur === "EUR" ? d.amount_eur : d.amount_ron)?.toLocaleString("ro-RO")} ${cur === "EUR" ? "€" : "lei"}`}${d.months >= 12 ? " la toate cele 12 rate" : d.months === 1 ? " la prima rată" : ` la primele ${d.months} rate`}`;

const addMonths = (d: Date, n: number, day: number) => {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  x.setUTCDate(day);
  return x;
};

export type ScheduleRow = { n: number; date: Date; base: number; discount: number; total: number; includes: string[] };

/** Desfășurătorul celor 12 rate, cu ce include fiecare lună. Aceeași regulă de dată ca la provizionare. */
export function paymentSchedule(cart: Cart, cur: Currency, d: Discount | null, start = new Date()): ScheduleRow[] {
  const { net } = cartLines(cart, cur);
  const day = Math.min(28, start.getUTCDate());
  const plan = PLANS[cart.plan];
  const imp = `${plan.improvements} ${plan.improvements === 1 ? "îmbunătățire" : "îmbunătățiri"} incluse`;
  const extras = [cart.brand && ADDONS.brand.name, cart.local && ADDONS.local.name, cart.langs > 0 && `${cart.langs} ${cart.langs > 1 ? "limbi suplimentare" : "limbă suplimentară"}`].filter(Boolean) as string[];
  return Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const disc = n <= (d?.months ?? 0) ? discountFor(d, net, cur) : 0;
    const includes =
      n === 1
        ? ["Brief, texte și design personalizat", "Dezvoltare și lansare în 10 zile lucrătoare", "Domeniu, hosting, SSL și backup zilnic", ...extras]
        : n === 12
          ? ["Hosting, mentenanță și monitorizare", imp, "Raport lunar", "Transferul proprietății după această plată"]
          : ["Hosting, mentenanță și monitorizare", imp, "Raport lunar pe email", ...extras];
    return { n, date: i === 0 ? start : addMonths(start, i, day), base: net, discount: disc, total: round2(net - disc), includes };
  });
}

/** Ce primește clientul, pe plan (folosit în carduri și în checkout). */
export const PLAN_FEATURES: Record<PlanCode, string[]> = {
  essential: ["Website personalizat", "Domeniu, hosting, SSL", "Mentenanță și backup", "1 îmbunătățire / lună", "Răspuns în 48h lucrătoare", "Statistici de trafic"],
  growth: ["+Tot din Esențial, plus:", "SEO + vizibilitate în AI (GEO)", "2 îmbunătățiri / lună", "Tracking conversii", "Integrări marketing", "Raport lunar + recomandări"],
  partner: ["+Tot din Creștere, plus:", "4 îmbunătățiri / lună", "Landing pages campanii", "Optimizare conversii (CRO)", "Automatizări și integrări", "Suport prioritar"],
};

/** Lista completă, fără trimiteri la alt plan (pentru checkout). */
export function allFeatures(plan: PlanCode): string[] {
  const order: PlanCode[] = ["essential", "growth", "partner"];
  const upto = order.slice(0, order.indexOf(plan) + 1);
  const seen = new Set<string>();
  return upto
    .flatMap((p) => PLAN_FEATURES[p].filter((f) => !f.startsWith("+")))
    .filter((f) => !/îmbunătățir/.test(f) || f.startsWith(String(PLANS[plan].improvements)))
    .filter((f) => (seen.has(f) ? false : (seen.add(f), true)));
}
