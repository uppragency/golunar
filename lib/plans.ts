export type PlanCode = "essential" | "growth" | "partner";
export type AddonCode = "brand" | "local" | "lang";
export type Currency = "RON" | "EUR";

export const PLANS: Record<PlanCode, { name: string; eur: number; ron: number; improvements: number; minMonths: number }> = {
  essential: { name: "Esențial", eur: 53, ron: 269, improvements: 1, minMonths: 3 },
  growth: { name: "Creștere", eur: 155, ron: 790, improvements: 2, minMonths: 2 },
  partner: { name: "Partener", eur: 271, ron: 1379, improvements: 4, minMonths: 1 },
};

export const ADDONS: Record<AddonCode, { name: string; eur: number; ron: number; maxCycles?: number; maxQty?: number }> = {
  brand: { name: "Identitate vizuală", eur: 79, ron: 399, maxCycles: 12 },
  local: { name: "Vizibilitate locală Google", eur: 19, ron: 99 },
  lang: { name: "Limbă suplimentară", eur: 29, ron: 149, maxQty: 5 },
};

/** LUNAR nu este plătitoare de TVA: prețurile afișate sunt prețuri finale. */
export const VAT_RATE = 0;
export const PRICE_NOTE = "TVA inclus";
export const EUR_RON = 5.09; // curs indicativ pentru afișare; facturile folosesc cursul BNR al zilei

export type Cart = { plan: PlanCode; brand: boolean; local: boolean; langs: number };

export function cartLines(cart: Cart, cur: Currency) {
  const k = cur === "EUR" ? "eur" : "ron";
  const lines: { code: PlanCode | AddonCode; label: string; qty: number; unit: number; total: number }[] = [
    { code: cart.plan, label: `Plan ${PLANS[cart.plan].name}`, qty: 1, unit: PLANS[cart.plan][k], total: PLANS[cart.plan][k] },
  ];
  if (cart.brand) lines.push({ code: "brand", label: "Identitate vizuală · 12 luni", qty: 1, unit: ADDONS.brand[k], total: ADDONS.brand[k] });
  if (cart.local) lines.push({ code: "local", label: ADDONS.local.name, qty: 1, unit: ADDONS.local[k], total: ADDONS.local[k] });
  if (cart.langs > 0)
    lines.push({
      code: "lang",
      label: `${cart.langs} ${cart.langs > 1 ? "limbi suplimentare" : "limbă suplimentară"}`,
      qty: cart.langs,
      unit: ADDONS.lang[k],
      total: ADDONS.lang[k] * cart.langs,
    });
  const net = lines.reduce((a, l) => a + l.total, 0);
  return { lines, net, vat: round2(net * VAT_RATE), gross: round2(net * (1 + VAT_RATE)) };
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Plata anuală: 12 luni plătite o dată, cu reducere; proprietatea se transferă după plată. */
export const ANNUAL_OFF = 0.2;
export type Billing = "monthly" | "annual";
export function annualTotal(cart: Cart, cur: Currency) {
  const { net } = cartLines(cart, cur);
  const full = round2(net * 12);
  const off = round2(full * ANNUAL_OFF);
  return { net, full, off, total: round2(full - off) };
}
export const toEur = (amount: number, cur: Currency) => (cur === "EUR" ? amount : amount / EUR_RON);
