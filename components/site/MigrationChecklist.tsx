"use client";

import { useEffect, useState } from "react";

export type Step = { id: string; t: string; d: string };
export type Phase = { title: string; steps: Step[] };

const KEY = "lunar_migration_checklist";

export default function MigrationChecklist({ phases }: { phases: Phase[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch {}
  }, []);
  const toggle = (id: string) =>
    setDone((d) => {
      const n = { ...d, [id]: !d[id] };
      try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
      return n;
    });
  const total = phases.reduce((a, p) => a + p.steps.length, 0);
  const count = phases.reduce((a, p) => a + p.steps.filter((s) => done[s.id]).length, 0);
  return (
    <div>
      <div className="progress" aria-live="polite">
        <b>{count}/{total}</b>
        <div className="track"><i style={{ width: `${(count / total) * 100}%` }} /></div>
        <button className="btn-plain sm" onClick={() => { setDone({}); try { localStorage.removeItem(KEY); } catch {} }}>Resetează</button>
      </div>
      {phases.map((p) => (
        <section key={p.title}>
          <h2>{p.title}</h2>
          <ul className="check-list">
            {p.steps.map((s) => (
              <li key={s.id}>
                <label>
                  <input type="checkbox" checked={Boolean(done[s.id])} onChange={() => toggle(s.id)} />
                  <div><b>{s.t}</b><span>{s.d}</span></div>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
