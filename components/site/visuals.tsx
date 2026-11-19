export function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Plus({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Check({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function Matrix({ type }: { type: "bars" | "flat" | "rows" | "own" }) {
  const C = 11, R = 9, g = 12;
  const dots: React.ReactNode[] = [];
  for (let x = 0; x < C; x++)
    for (let y = 0; y < R; y++) {
      let on = false, big = false;
      if (type === "bars") { const h = Math.round(2 + x * 0.65); on = y >= R - h; big = on && y > R - 3; }
      if (type === "flat") { on = y >= R - 3 || (y >= R - 5 && x % 2 === 0); big = y === R - 1; }
      if (type === "rows") { on = y % 3 === 0; big = on && ((y === 0 && x >= 8) || (y === 3 && x >= 9) || (y === 6 && [3, 4, 7, 8].includes(x))); }
      if (type === "own") { on = (x < 9 && y >= 2 && y <= 6) || x === 9; big = x === 9; }
      const r = big ? 3.6 : on ? 2.2 : 1;
      const o = on ? (big ? 1 : 0.85) : 0.18;
      dots.push(<circle key={`${x}-${y}`} cx={x * g + 8} cy={y * g + 8} r={r} fill="#fff" opacity={o} />);
    }
  return <svg viewBox={`0 0 ${C * g + 4} ${R * g + 4}`} aria-hidden="true">{dots}</svg>;
}

export function Tower({ n }: { n: number }) {
  return (
    <div className="tower" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <i key={i} className={i < n ? "hot" : ""} style={{ height: 20 + i * 11 }} />)}
    </div>
  );
}
