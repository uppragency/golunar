/** Tabel de comparație LUNAR vs o alternativă (folosit în paginile din Resurse). */
export default function VsTable({ other, rows }: { other: string; rows: [string, string, string][] }) {
  return (
    <div className="cmp-scroll">
      <table className="cmp">
        <thead><tr><th scope="col"><span className="sr-only">Criteriu</span></th><th scope="col" className="cmp-l">LUNAR</th><th scope="col">{other}</th></tr></thead>
        <tbody>
          {rows.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td className="cmp-l"><i aria-hidden="true">✓</i>{a}</td><td>{b}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
