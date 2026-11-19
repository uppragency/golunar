"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, RESOURCES, type ResourceCategory } from "@/lib/resources";

export default function ResourceHub() {
  const [cat, setCat] = useState<ResourceCategory | "toate">("toate");
  const list = RESOURCES.filter((r) => cat === "toate" || r.categories.includes(cat));
  return (
    <>
      <div className="filters hub-filters" role="tablist" aria-label="Categorii">
        {CATEGORIES.map((c) => {
          const n = c.key === "toate" ? RESOURCES.length : RESOURCES.filter((r) => r.categories.includes(c.key as ResourceCategory)).length;
          return (
            <button key={c.key} role="tab" aria-selected={cat === c.key} className={cat === c.key ? "on" : ""} onClick={() => setCat(c.key)} disabled={!n}>
              {c.label} · {n}
            </button>
          );
        })}
      </div>
      <div className="res hub">
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
