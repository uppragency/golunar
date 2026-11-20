"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, RESOURCES, type ResourceCategory } from "@/lib/resources";

/** Instrumente care trăiesc în afara /resurse, afișate în hub. */
const TOOLS = [
  { href: "/audit", kicker: "Instrument gratuit", title: "Audit SEO gratuit pentru site-ul tău", excerpt: "Viteza pe mobil, SEO tehnic și ce merită reparat întâi, în 60 de secunde. Raportul complet vine pe email.", meta: "1 min · rezultat instant", cat: "instrument" as ResourceCategory },
];

export default function ResourceHub() {
  const [cat, setCat] = useState<ResourceCategory | "toate">("toate");
  const list = RESOURCES.filter((r) => cat === "toate" || r.categories.includes(cat));
  return (
    <>
      <div className="filters hub-filters" role="tablist" aria-label="Categorii">
        {CATEGORIES.map((c) => {
          const n = c.key === "toate" ? RESOURCES.length + TOOLS.length : RESOURCES.filter((r) => r.categories.includes(c.key as ResourceCategory)).length + TOOLS.filter((t) => t.cat === c.key).length;
          return (
            <button key={c.key} role="tab" aria-selected={cat === c.key} className={cat === c.key ? "on" : ""} onClick={() => setCat(c.key)} disabled={!n}>
              {c.label} · {n}
            </button>
          );
        })}
      </div>
      <div className="res hub">
        {TOOLS.filter((t) => cat === "toate" || t.cat === cat).map((t) => (
          <Link key={t.href} href={t.href} className="card">
            <span className="k">{t.kicker}</span>
            <div><h4>{t.title}</h4><p>{t.excerpt}</p></div>
            <span>{t.meta} <span className="go-arrow">→</span></span>
          </Link>
        ))}
        {list.map((r) => (
          <Link key={r.slug} href={`/resurse/${r.slug}`} className="card">
            <span className="k">{r.kicker}</span>
            <div><h4>{r.title}</h4><p>{r.excerpt}</p></div>
            <span>{r.minutes} min{r.extra ? ` · ${r.extra}` : ""} <span className="go-arrow">→</span></span>
          </Link>
        ))}
      </div>
    </>
  );
}
