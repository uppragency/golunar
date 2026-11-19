/** Evenimente pentru Google Tag Manager (dataLayer). Etichetele din GTM decid unde ajung (GA4, Google Ads, Meta), respectând consimțământul. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}
