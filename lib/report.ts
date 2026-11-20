import * as Sentry from "@sentry/nextjs";

/** Raportează în Sentry o eroare tratată (care altfel ar rămâne doar în loguri), cu zona în care a apărut. */
export function reportError(area: string, err: unknown, extra?: Record<string, unknown>) {
  const e = err instanceof Error ? err : new Error(typeof err === "string" ? err : (err as { message?: string })?.message || JSON.stringify(err));
  console.error(`[${area}]`, e.message);
  Sentry.withScope((scope) => {
    scope.setTag("area", area);
    if (extra) scope.setContext("detalii", extra);
    Sentry.captureException(e);
  });
}
