import * as Sentry from "@sentry/nextjs";
import { DATA_COLLECTION, IGNORE, scrub } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "production",
  // Erorile din browser trec prin golunar.ro (nu sunt blocate de adblockere); serverul le trimite la Sentry.
  tunnel: true,
  dataCollection: { ...DATA_COLLECTION, httpBodies: [] },
  ignoreErrors: IGNORE,
  denyUrls: [/googletagmanager\.com/, /google-analytics\.com/, /connect\.facebook\.net/, /^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-extension:\/\//],
  beforeSend: scrub,
});

/** Navigările din aplicație apar ca pași înaintea unei erori (fără măsurarea performanței). */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
