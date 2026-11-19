"use client";
export default function PrintButton() {
  return <button type="button" className="btn-plain" onClick={() => window.print()}>Descarcă PDF</button>;
}
