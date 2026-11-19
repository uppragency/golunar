"use client";

import { Analytics } from "@vercel/analytics/next";

/** Vercel Web Analytics (fără cookie-uri). Paginile de admin nu se contorizează. */
export default function VercelAnalytics() {
  return <Analytics beforeSend={(e) => (new URL(e.url).pathname.startsWith("/admin") ? null : e)} />;
}
