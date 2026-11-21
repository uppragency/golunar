"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { mk } from "@/lib/mktr";
import { RATE_SLUGS } from "@/lib/rate-slugs";

const KEY = process.env.NEXT_PUBLIC_MKTR_TRACKING_KEY;

/** Pagini care prezintă oferta: raportate ca „categorie” (planurile și opțiunile din feed). */
const OFFER_PAGES = new Set(["/website-4-99-lei", "/cum-lucram", "/garantii", ...RATE_SLUGS.map((s) => `/${s}`)]);

function load() {
  if (!KEY || document.getElementById("mktr-js")) return;
  const w = window as unknown as { mktr_key?: string };
  w.mktr_key = KEY;
  const s = document.createElement("script");
  s.id = "mktr-js";
  s.async = true;
  s.src = `https://t.themarketer.com/t/j/${KEY}`;
  document.head.appendChild(s);
}

/** theMarketer: scriptul se încarcă doar cu acordul pentru cookie-uri de marketing; evenimentele de pagină la fiecare navigare. */
export default function Mktr() {
  const path = usePathname() || "/";

  useEffect(() => {
    if (path.startsWith("/admin")) return;
    const check = () => { let c: string | null = null; try { c = localStorage.getItem("lunar-consent"); } catch {} if (c === "granted") load(); };
    check();
    window.addEventListener("lunar:consent", check);
    return () => window.removeEventListener("lunar:consent", check);
  }, [path]);

  useEffect(() => {
    if (path.startsWith("/admin")) return;
    if (path === "/") mk("view_homepage");
    else if (OFFER_PAGES.has(path)) mk("view_category", { category: "Website|Abonamente" });
  }, [path]);

  return null;
}
