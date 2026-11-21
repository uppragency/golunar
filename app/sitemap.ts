import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { RESOURCES } from "@/lib/resources";
import { CITIES, INDUSTRIES } from "@/lib/landings";
import { RATE_PAGES } from "@/lib/rate-pages";

const SITE_UPDATED = "2026-11-19";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string, lastModified: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number) => ({
    url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority,
  });
  return [
    u("/", SITE_UPDATED, "weekly", 1),
    u("/website-4-99-lei", SITE_UPDATED, "weekly", 0.9),
    u("/audit", SITE_UPDATED, "monthly", 0.8),
    u("/cum-lucram", SITE_UPDATED, "monthly", 0.7),
    u("/garantii", SITE_UPDATED, "monthly", 0.7),
    u("/legal/termeni", SITE_UPDATED, "yearly", 0.3),
    u("/legal/confidentialitate", SITE_UPDATED, "yearly", 0.3),
    u("/legal/cookies", SITE_UPDATED, "yearly", 0.3),
    u("/portofoliu", SITE_UPDATED, "monthly", 0.8),
    u("/tehnologii", SITE_UPDATED, "monthly", 0.6),
    u("/intrebari-frecvente", SITE_UPDATED, "monthly", 0.7),
    u("/migrare-website", SITE_UPDATED, "monthly", 0.7),
    u("/contact", SITE_UPDATED, "yearly", 0.5),
    u("/lunar-vs-agentie-vs-ai", SITE_UPDATED, "monthly", 0.7),
    ...INDUSTRIES.map((l) => u(`/${l.slug}`, l.updated, "monthly", 0.8)),
    ...CITIES.map((l) => u(`/${l.slug}`, l.updated, "monthly", 0.8)),
    ...RATE_PAGES.map((p) => u(`/${p.slug}`, p.updated, "monthly", 0.8)),
    u("/resurse", SITE_UPDATED, "weekly", 0.7),
    ...RESOURCES.map((r) => u(`/resurse/${r.slug}`, r.updated, "monthly", 0.7)),
    u("/status", new Date().toISOString().slice(0, 10), "daily", 0.3),
  ];
}
