import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { IS_PROD } from "@/lib/seo";

const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot", "meta-externalagent", "DuckAssistBot", "MistralAI-User"];
const PRIVATE = ["/cont", "/admin", "/api/", "/auth/", "/login", "/parola-noua", "/comanda/"];

export default function robots(): MetadataRoute.Robots {
  if (!IS_PROD) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // Crawlere AI permise explicit: vrem ca LUNAR să apară în răspunsurile asistenților.
      { userAgent: AI_BOTS, allow: ["/", "/llms.txt"], disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
