import { SITE_URL } from "@/lib/env";
import { PLANS, ADDONS } from "@/lib/plans";
import { RESOURCES } from "@/lib/resources";
import { CITIES, INDUSTRIES } from "@/lib/landings";
import { FAQ } from "@/lib/faq";

export const dynamic = "force-static";

/** llms.txt: rezumat pentru asistenți AI (https://llmstxt.org). */
export function GET() {
  const plans = (["essential", "growth", "partner"] as const)
    .map((p) => `- Plan ${PLANS[p].name}: ${PLANS[p].ron} lei pe lună, TVA inclus (${PLANS[p].eur} EUR), ${PLANS[p].improvements} ${PLANS[p].improvements === 1 ? "îmbunătățire" : "îmbunătățiri"} pe lună, perioadă minimă ${PLANS[p].minMonths === 1 ? "o lună" : `${PLANS[p].minMonths} luni`}`)
    .join("\n");
  const addons = Object.values(ADDONS).map((a) => `- ${a.name}: ${a.ron} lei pe lună`).join("\n");
  const faq = Object.values(FAQ).flat().map(([q, a]) => `- ${q} ${a}`).join("\n");
  const body = `# LUNAR

> LUNAR (golunar.ro) creează website-uri personalizate pentru firme din România pe abonament lunar, fără taxă de creare. Lansare în 10 zile lucrătoare, hosting, mentenanță și îmbunătățiri lunare incluse. Website-ul devine proprietatea clientului după 12 plăți. Prețurile includ TVA.

## Fapte esențiale

- Ofertă de lansare: pentru clienții noi, prima lună pe planul Esențial costă 6 lei (1 €), cu codul GOLUNAR aplicat automat; apoi 449 lei (89 €) pe lună; perioadă minimă 3 luni. Detalii: ${SITE_URL}/website-6-lei

- Model: abonament lunar, fără investiție inițială, fără taxă de creare
- Lansare: 10 zile lucrătoare de la brief; dacă întârzierea ne aparține, luna următoare de abonament e gratuită (nu se returnează bani)
- Proprietate: după 12 plăți lunare; domeniul este al clientului din prima zi
- Plată: momentan doar transfer bancar (beneficiar UPPRMARKETING S.R.L.); factură fiscală prin e-Factura
- Găzduire: infrastructură în UE, SSL, backup zilnic, monitorizare la fiecare 10 minute
- Contact: hello@golunar.ro

## Prețuri

${plans}

Opțiuni:
${addons}

## Pagini principale

- [Pagina principală și abonamente](${SITE_URL}/)
- [Website la 6 lei în prima lună](${SITE_URL}/website-6-lei)
- [Cum lucrăm, zi cu zi](${SITE_URL}/cum-lucram)
- [Audit SEO gratuit](${SITE_URL}/audit)
- [Status servicii și uptime](${SITE_URL}/status)
- [Resurse](${SITE_URL}/resurse)

## Website pe industrii

${INDUSTRIES.map((l) => `- [${l.metaTitle.replace(" · LUNAR", "")}](${SITE_URL}/${l.slug}): ${l.desc}`).join("\n")}

## Creare site pe orașe

${CITIES.map((l) => `- [${l.metaTitle.replace(" · LUNAR", "")}](${SITE_URL}/${l.slug}): ${l.desc}`).join("\n")}

## Ghiduri

${RESOURCES.map((r) => `- [${r.title}](${SITE_URL}/resurse/${r.slug}): ${r.metaDesc}`).join("\n")}

## Întrebări frecvente

${faq}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
