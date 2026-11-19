"use client";

import { useEffect } from "react";

/** Salvează ?ref=COD într-un cookie de 90 de zile, pentru programul de recomandare. */
export default function RefCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref")?.toUpperCase();
    if (ref && /^[A-Z0-9]{4,12}$/.test(ref)) {
      document.cookie = `lunar_ref=${ref}; Max-Age=${60 * 60 * 24 * 90}; Path=/; SameSite=Lax; Secure`;
    }
  }, []);
  return null;
}
