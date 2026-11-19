"use client";

import { useState } from "react";

export default function CopyField({ value, label = "Copiază" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="copy-field">
      <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} aria-label="Link de recomandare" />
      <button type="button" className="btn-plain" onClick={async () => { await navigator.clipboard.writeText(value).catch(() => {}); setDone(true); setTimeout(() => setDone(false), 1800); }}>
        {done ? "Copiat" : label}
      </button>
    </div>
  );
}
