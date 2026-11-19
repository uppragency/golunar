export function Bars({ data }: { data: { label: string; value: number; title?: string }[] }) {
  const mx = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <div className="empty">Datele apar după prima lună de activitate.</div>;
  return (
    <div className="chart" role="img" aria-label={data.map((d) => `${d.label}: ${d.title ?? d.value}`).join(", ")}>
      {data.map((d, i) => (
        <div className="c" key={i} title={d.title ?? String(d.value)}>
          <i className="anim" style={{ height: `${(d.value / mx) * 85}%`, animationDelay: `${i * 40}ms` }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Ring({ paid, total = 12 }: { paid: number; total?: number }) {
  const C = 364.4;
  return (
    <div className="ring">
      <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
        <circle cx="66" cy="66" r="58" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
        <circle cx="66" cy="66" r="58" fill="none" stroke="#FF5B1F" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(paid, total) / total)} />
      </svg>
      <div className="c"><div><b>{Math.min(paid, total)}/{total}</b><br /><span>rate plătite</span></div></div>
    </div>
  );
}

export function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const mx = Math.max(...values), mn = Math.min(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 300},${70 - ((v - mn) / (mx - mn || 1)) * 56}`).join(" ");
  return (
    <svg className="spark" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FF5B1F" stopOpacity=".35" /><stop offset="1" stopColor="#FF5B1F" stopOpacity="0" /></linearGradient></defs>
      <path d={`M0,80 L${pts} L300,80Z`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke="#FF5B1F" strokeWidth="2" />
    </svg>
  );
}

export function Pill({ tone, children }: { tone?: "ok" | "warn" | "bad" | "acc"; children: React.ReactNode }) {
  return <span className={`pill${tone ? ` ${tone}` : ""}`}><span className="d" />{children}</span>;
}
