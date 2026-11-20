import * as Sentry from "@sentry/nextjs";
import { DATA_COLLECTION, IGNORE, scrub } from "@/lib/sentry-scrub";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.VERCEL_ENV || "production",
  dataCollection: { ...DATA_COLLECTION, httpBodies: [] },
  ignoreErrors: IGNORE,
  // Primește erorile din browser (tunnel: true) și le trimite mai departe către Sentry.
  integrations: [Sentry.serveTunnelIntegration()],
  beforeSend: scrub,
});
