import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Filtrare GDPR înainte de trimiterea către Sentry: fără IP, cookie-uri, corpul cererilor
 * sau adrese de email / telefoane în mesaje. Erorile rămân utile, datele personale nu pleacă.
 */
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+?40|0)\s?7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g;
const clean = (s?: string) => (s ? s.replace(EMAIL, "[email]").replace(PHONE, "[telefon]") : s);

export function scrub(event: ErrorEvent): ErrorEvent {
  if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    const ua = event.request.headers?.["user-agent"];
    event.request.headers = ua ? { "user-agent": ua } : undefined;
    if (event.request.query_string) event.request.query_string = "[filtrat]";
    if (event.request.url) event.request.url = event.request.url.split("?")[0];
  }
  event.message = clean(event.message);
  for (const ex of event.exception?.values ?? []) ex.value = clean(ex.value);
  for (const b of event.breadcrumbs ?? []) {
    b.message = clean(b.message);
    if (b.data && typeof b.data.url === "string") b.data.url = b.data.url.split("?")[0];
  }
  return event;
}

export const IGNORE = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",
  "Non-Error promise rejection captured",
  /^NEXT_REDIRECT/,
  /^NEXT_NOT_FOUND/,
  /Load failed/,
  /Failed to fetch/,
  /NetworkError when attempting to fetch resource/,
];

/** Colectare minimă (Sentry v11 colectează implicit tot): fără utilizator, cookie-uri, corpuri, parametri de URL. */
export const DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: { allow: ["user-agent", "referer"] }, response: false },
  urlQueryParams: false,
  genAI: { inputs: false, outputs: false },
};
