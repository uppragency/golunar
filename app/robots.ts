import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { IS_PROD } from "@/lib/seo";

const PRIVATE = ["/cont", "/admin", "/api/", "/auth/", "/login", "/parola-noua", "/comanda/"];

export default function robots(): MetadataRoute.Robots {
  if (!IS_PROD) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
