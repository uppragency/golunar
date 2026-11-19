import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { RESOURCES } from "@/lib/resources";
import { CITIES, INDUSTRIES } from "@/lib/landings";

const SITE_UPDATED = "2026-11-19";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string, lastModified: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number) => ({
    url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority,
  });
  return [
    u("/", SITE_UPDATED, "weekly", 1),
    u("/website-6-lei", SITE_UPDATED, "weekly", 0.9),
    u("/audit", SITE_UPDATED, "monthly", 0.8),
    u("/cum-lucram", SITE_UPDATED, "monthly", 0.7),
    u("/garantii", SITE_UPDATED, "monthly", 0.7),
    u("/portofoliu", SITE_UPDATED, "monthly", 0.8),
    u("/lunar-vs-agentie-vs-ai", SITE_UPDATED, "monthly", 0.7),
    ...INDUSTRIES.map((l) => u(`/${l.slug}`, l.updated, "monthly", 0.8)),
    ...CITIES.map((l) => u(`/${l.slug}`, l.updated, "monthly", 0.8)),
    u("/resurse", SITE_UPDATED, "weekly", 0.7),
    ...RESOURCES.map((r) => u(`/resurse/${r.slug}`, r.updated, "monthly", 0.7)),
    u("/status", new Date().toISOString().slice(0, 10), "daily", 0.3),
  ];
}
