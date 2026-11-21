/**
 * Evenimente theMarketer (format oficial: dataLayer.push cu event "__sm__…").
 * Scriptul theMarketer se încarcă doar după acordul pentru cookie-uri (components/Mktr.tsx);
 * evenimentele împinse înainte rămân în dataLayer și sunt preluate la încărcare.
 */
import { ADDONS, PLANS, hasAiAddon, type Cart, type Currency, type PlanCode } from "@/lib/plans";

type Obj = Record<string, unknown>;

export function mk(event: string, params: Obj = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: `__sm__${event}`, ...params });
}

const split = (full?: string) => {
  const p = (full || "").trim().split(/\s+/).filter(Boolean);
  return { firstname: p[0] || "", lastname: p.slice(1).join(" ") || "" };
};
const validEmail = (e?: string) => Boolean(e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim()));

/** Identifică vizitatorul (formulare, comandă, login). */
export function mkIdentify(email?: string, name?: string, phone?: string) {
  if (!validEmail(email)) return;
  const { firstname, lastname } = split(name);
  mk("set_email", {
    email_address: email!.trim().toLowerCase(),
    ...(phone ? { phone } : {}),
    ...(firstname ? { firstname } : {}),
    ...(lastname ? { lastname } : {}),
  });
}

export function mkPhone(phone?: string) {
  if (phone && phone.replace(/\D/g, "").length >= 9) mk("set_phone", { phone });
}

/** Eveniment personalizat (trebuie creat în theMarketer → Settings → Technical integration). Emailul e obligatoriu. */
export function mkCustom(identifier: string, email?: string, payload: Obj = {}) {
  if (!validEmail(email)) return;
  mk(identifier, { email: email!.trim().toLowerCase(), payload });
}

/** Produsele din feed: planurile și opțiunile (id-uri stabile, aceleași ca în /feed/themarketer.xml). */
export function cartProducts(cart: Cart, cur: Currency) {
  const k = cur === "EUR" ? "eur" : "ron";
  const items: { product_id: string; price: number; quantity: number }[] = [{ product_id: cart.plan, price: PLANS[cart.plan][k], quantity: 1 }];
  if (cart.brand) items.push({ product_id: "brand", price: ADDONS.brand[k], quantity: 1 });
  if (cart.local) items.push({ product_id: "local", price: ADDONS.local[k], quantity: 1 });
  if (hasAiAddon(cart)) items.push({ product_id: "ai", price: ADDONS.ai[k], quantity: 1 });
  if (cart.langs > 0) items.push({ product_id: "lang", price: ADDONS.lang[k], quantity: cart.langs });
  return items;
}

const variation = (id: string) => ({ id, sku: id });

export function mkCartAdd(product_id: string, quantity = 1) {
  mk("add_to_cart", { product_id, quantity, variation: variation(product_id) });
}
export function mkCartRemove(product_id: string, quantity = 1) {
  mk("remove_from_cart", { product_id, quantity, variation: variation(product_id) });
}

/** Diferența dintre două coșuri, ca evenimente add/remove. */
export function mkCartDiff(prev: Cart | null, next: Cart, cur: Currency) {
  const q = (c: Cart | null) => new Map((c ? cartProducts(c, cur) : []).map((i) => [i.product_id, i.quantity]));
  const a = q(prev), b = q(next);
  for (const [id, n] of b) { const o = a.get(id) ?? 0; if (n > o) mkCartAdd(id, n - o); }
  for (const [id, o] of a) { const n = b.get(id) ?? 0; if (o > n) mkCartRemove(id, o - n); }
}

export function mkViewPlan(plan: PlanCode) {
  mk("view_product", { product_id: plan });
}

/** Comanda: datele se păstrează în sesiune la trimitere și se raportează pe pagina de mulțumire. */
export type MkOrder = {
  email: string; name: string; phone: string; address: string; company: string;
  discountCode: string; discountValue: number; total: number; cart: Cart; currency: Currency;
};
const ORDER_KEY = "lunar_mktr_order";
export function mkStashOrder(o: MkOrder) {
  try { sessionStorage.setItem(ORDER_KEY, JSON.stringify(o)); } catch {}
}
export function mkReportOrder(number: string) {
  let o: MkOrder | null = null;
  try { o = JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null"); sessionStorage.removeItem(ORDER_KEY); } catch {}
  if (!o) return;
  const { firstname, lastname } = split(o.name);
  mk("order", {
    number,
    email_address: o.email.trim().toLowerCase(),
    phone: o.phone,
    firstname,
    lastname,
    city: "",
    county: "",
    address: o.address,
    discount_value: o.discountValue,
    discount_code: o.discountCode,
    shipping: 0,
    tax: 0,
    total_value: o.total,
    products: cartProducts(o.cart, o.currency).map((p) => ({ product_id: p.product_id, price: p.price, quantity: p.quantity, variation_sku: p.product_id })),
  });
}
