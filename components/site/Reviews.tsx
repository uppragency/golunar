import { GOOGLE_REVIEWS_URL, REVIEWS, ratingSummary } from "@/lib/reviews";

/** Recenzii reale. Nu afișează nimic cât timp lib/reviews.ts e gol. */
export default function Reviews() {
  const r = ratingSummary();
  if (!r) return null;
  return (
    <section className="sec rev" id="recenzii">
      <div className="wrap">
        <div className="sec-head reveal in">
          <div><div className="eyebrow">Recenzii</div><h2 style={{ marginTop: 20 }}>{r.value.toLocaleString("ro-RO")} din 5. <span className="dim">{r.count} {r.count === 1 ? "recenzie" : "recenzii"} pe Google.</span></h2></div>
          {GOOGLE_REVIEWS_URL && <p><a className="inl" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener">Vezi toate recenziile pe Google ↗</a></p>}
        </div>
        <div className="rev-grid">
          {REVIEWS.map((x) => (
            <figure className="card rev-card" key={x.author + x.date}>
              <div className="rev-stars" aria-label={`${x.rating} din 5 stele`}>{"★".repeat(x.rating)}<span>{"★".repeat(5 - x.rating)}</span></div>
              <blockquote>{x.text}</blockquote>
              <figcaption><b>{x.author}</b>{x.company ? <span>{x.company}</span> : null}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
