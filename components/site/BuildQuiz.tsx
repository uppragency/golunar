"use client";

import { useState } from "react";
import Link from "next/link";

type Opt = { label: string; score: [number, number, number] }; // [DIY, AI builder, agenție]
const QUESTIONS: { q: string; opts: Opt[] }[] = [
  { q: "Cât timp poți aloca săptămânal site-ului?", opts: [{ label: "5+ ore", score: [2, 1, 0] }, { label: "1–2 ore", score: [0, 2, 1] }, { label: "Aproape deloc", score: [0, 0, 2] }] },
  { q: "Cât de important e designul unic, diferit de concurență?", opts: [{ label: "Puțin", score: [1, 2, 0] }, { label: "Destul de", score: [1, 1, 1] }, { label: "Foarte", score: [0, 0, 2] }] },
  { q: "Clienții te găsesc din Google sau din reclame plătite?", opts: [{ label: "Nu, din recomandări", score: [1, 2, 0] }, { label: "Parțial", score: [0, 1, 1] }, { label: "Da, majoritatea", score: [0, 0, 2] }] },
  { q: "Ai experiență cu SEO, viteză și tracking de conversii?", opts: [{ label: "Da", score: [2, 1, 0] }, { label: "Puțină", score: [0, 2, 1] }, { label: "Deloc", score: [0, 0, 2] }] },
  { q: "Cum preferi să plătești?", opts: [{ label: "Cât mai puțin, fac eu", score: [2, 1, 0] }, { label: "Abonament mic de platformă", score: [0, 2, 0] }, { label: "Lunar, cu tot inclus", score: [0, 0, 2] }] },
];

const RESULTS = [
  { title: "DIY e potrivit pentru tine", text: "Ai timp și competențe tehnice. Construiește site-ul pe o platformă open-source, cu hosting propriu, și bugetează câteva ore lunar pentru mentenanță și securitate." },
  { title: "Un AI builder e un început bun", text: "Pentru o prezență simplă, fără multe pagini sau campanii, un builder te duce online în câteva ore. Când începi să plătești reclame, verifică viteza, SEO-ul și tracking-ul conversiilor." },
  { title: "Ai nevoie de o echipă", text: "Site-ul tău trebuie să aducă clienți, iar timpul tău valorează mai mult în afacere. Alege o agenție sau un abonament care include design, SEO, mentenanță și îmbunătățiri lunare." },
];

export default function BuildQuiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));
  const done = answers.every((a) => a !== null);
  const totals = [0, 1, 2].map((i) => answers.reduce<number>((s, a, qi) => s + (a === null ? 0 : QUESTIONS[qi].opts[a].score[i]), 0));
  const best = totals.indexOf(Math.max(...totals));
  return (
    <div className="quiz">
      {QUESTIONS.map((q, qi) => (
        <div className="q" key={q.q}>
          <p>{qi + 1}. {q.q}</p>
          <div className="opts">
            {q.opts.map((o, oi) => (
              <button key={o.label} className={answers[qi] === oi ? "on" : ""} aria-pressed={answers[qi] === oi}
                onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))}>{o.label}</button>
            ))}
          </div>
        </div>
      ))}
      {done ? (
        <div className="result" aria-live="polite">
          <h3>{RESULTS[best].title}</h3>
          <p>{RESULTS[best].text}</p>
          {best === 2 && <p style={{ marginTop: 10 }}><Link href="/#abonamente" className="inl">Vezi abonamentele LUNAR →</Link></p>}
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 14 }}>Răspunde la toate cele 5 întrebări ca să vezi recomandarea.</p>
      )}
    </div>
  );
}
