import { ADDONS, PLANS, type AddonCode, type PlanCode } from "@/lib/plans";
import { SITE_URL } from "@/lib/env";

/**
 * Feed de produse pentru theMarketer: planurile și opțiunile LUNAR, cu aceleași id-uri
 * ca evenimentele din lib/mktr.ts (view_product, add_to_cart, order). Prețuri în lei, TVA inclus.
 */
export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PLAN_DESC: Record<PlanCode, string> = {
  essential: "Website personalizat pe abonament lunar: design, domeniu, hosting, mentenanță și o îmbunătățire lunară. Al tău după 12 plăți.",
  growth: "Website pe abonament cu SEO lunar, vizibilitate în AI și măsurarea conversiilor. Două îmbunătățiri lunare. Al tău după 12 plăți.",
  partner: "Website pe abonament cu landing pages pentru campanii, optimizarea conversiilor și automatizări. Patru îmbunătățiri lunare.",
};
const ADDON_DESC: Record<AddonCode, string> = {
  brand: "Identitate vizuală: logo și ghid de brand, plătit lunar timp de 12 luni.",
  local: "Vizibilitate locală Google: optimizarea profilului Google Business și a prezenței locale.",
  ai: "Vizibilitate în AI: optimizare pentru ChatGPT, Gemini și Perplexity, cu raport lunar.",
  lang: "Limbă suplimentară pentru website, cu traducere și pagini dedicate.",
};

function item(o: { id: string; name: string; desc: string; url: string; category: string; price: number }) {
  const img = `${SITE_URL}/opengraph-image`;
  return `  <product>
    <id>${o.id}</id>
    <sku>${o.id}</sku>
    <name>${esc(o.name)}</name>
    <description><![CDATA[${o.desc}]]></description>
    <url>${esc(o.url)}</url>
    <main_image>${img}</main_image>
    <category>${esc(o.category)}</category>
    <brand>LUNAR</brand>
    <acquisition_price>0</acquisition_price>
    <price>${o.price.toFixed(2)}</price>
    <sale_price>${o.price.toFixed(2)}</sale_price>
    <availability>1</availability>
    <stock>999</stock>
    <media_gallery>
      <image>${img}</image>
    </media_gallery>
    <variations></variations>
    <created_at>2026-11-19 00:00</created_at>
    <extra_attributes></extra_attributes>
  </product>`;
}

export function GET() {
  const plans = (Object.keys(PLANS) as PlanCode[]).map((k) =>
    item({ id: k, name: `Website pe abonament · Plan ${PLANS[k].name}`, desc: PLAN_DESC[k], url: `${SITE_URL}/?plan=${k}#abonamente`, category: "Website|Abonamente", price: PLANS[k].ron }),
  );
  const addons = (Object.keys(ADDONS) as AddonCode[]).map((k) =>
    item({ id: k, name: ADDONS[k].name, desc: ADDON_DESC[k], url: `${SITE_URL}/#abonamente`, category: "Website|Opțiuni", price: ADDONS[k].ron }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<products>\n${[...plans, ...addons].join("\n")}\n</products>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
