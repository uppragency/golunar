/**
 * Recenzii reale ale clienților (copiate de pe Google, cu acordul lor). Lista goală = nicio secțiune și niciun rating în schema.
 * Regula Google: ratingul din schema trebuie să corespundă recenziilor afișate pe pagină, deci le adaugi doar aici.
 */
export type Review = { author: string; company?: string; rating: 1 | 2 | 3 | 4 | 5; text: string; date: string /* YYYY-MM-DD */ };

export const REVIEWS: Review[] = [];

/** Linkul public spre recenziile Google ale LUNAR (Google Business Profile). */
export const GOOGLE_REVIEWS_URL = "";

export const ratingSummary = () => {
  if (!REVIEWS.length) return null;
  const avg = REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length;
  return { value: Math.round(avg * 10) / 10, count: REVIEWS.length };
};
