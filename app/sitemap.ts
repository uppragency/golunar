import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { RESOURCES } from "@/lib/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/resurse`, changeFrequency: "weekly", priority: 0.8 },
    ...RESOURCES.map((r) => ({ url: `${SITE_URL}/resurse/${r.slug}`, lastModified: r.updated, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
