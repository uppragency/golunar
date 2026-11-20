import Link from "next/link";
import { Fragment } from "react";

/**
 * Markdown minimal pentru articolele din Resurse (fără dependențe):
 * ## / ### titluri, paragrafe, liste (- și 1.), tabele (| a | b |), casete (> **Titlu** text),
 * **bold** și [text](url). Linkurile interne folosesc next/link.
 */

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function inline(text: string, key = 0): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${key}-${i++}`}>{m[1]}</strong>);
    else {
      const href = m[3];
      out.push(
        href.startsWith("/")
          ? <Link key={`${key}-${i++}`} href={href} className="inl">{m[2]}</Link>
          : <a key={`${key}-${i++}`} href={href} className="inl" target="_blank" rel="noopener">{m[2]}</a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { t: "h2" | "h3" | "p"; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "table"; rows: string[][] }
  | { t: "callout"; title: string; text: string[] };

export function parse(src: string): Block[] {
  const lines = src.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i].trimEnd();
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("### ")) { blocks.push({ t: "h3", text: l.slice(4) }); i++; continue; }
    if (l.startsWith("## ")) { blocks.push({ t: "h2", text: l.slice(3) }); i++; continue; }
    if (/^- /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2).trim());
      blocks.push({ t: "ul", items }); continue;
    }
    if (/^\d+\. /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, "").trim());
      blocks.push({ t: "ol", items }); continue;
    }
    if (l.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i++].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
      }
      blocks.push({ t: "table", rows }); continue;
    }
    if (l.startsWith("> ")) {
      const text: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) text.push(lines[i++].replace(/^>\s?/, ""));
      const m = /^\*\*([^*]+)\*\*\s*(.*)$/.exec(text[0] ?? "");
      blocks.push({ t: "callout", title: m ? m[1] : "", text: m ? [m[2], ...text.slice(1)].filter(Boolean) : text });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |- |\d+\. |\||> )/.test(lines[i])) para.push(lines[i++].trim());
    blocks.push({ t: "p", text: para.join(" ") });
  }
  return blocks;
}

export function headings(src: string) {
  return parse(src).filter((b): b is { t: "h2"; text: string } => b.t === "h2").map((b) => ({ id: slugify(b.text), text: b.text }));
}

export default function Md({ src }: { src: string }) {
  return (
    <>
      {parse(src).map((b, k) => {
        switch (b.t) {
          case "h2": return <h2 key={k} id={slugify(b.text)}>{inline(b.text, k)}</h2>;
          case "h3": return <h3 key={k}>{inline(b.text, k)}</h3>;
          case "p": return <p key={k}>{inline(b.text, k)}</p>;
          case "ul": return <ul key={k}>{b.items.map((x, j) => <li key={j}>{inline(x, k * 100 + j)}</li>)}</ul>;
          case "ol": return <ol key={k}>{b.items.map((x, j) => <li key={j}>{inline(x, k * 100 + j)}</li>)}</ol>;
          case "table":
            return (
              <div key={k} className="tbl-wrap">
                <table>
                  <thead><tr>{b.rows[0].map((c, j) => <th key={j}>{inline(c, j)}</th>)}</tr></thead>
                  <tbody>{b.rows.slice(1).map((r, j) => <tr key={j}>{r.map((c, x) => <td key={x}>{inline(c, j * 10 + x)}</td>)}</tr>)}</tbody>
                </table>
              </div>
            );
          case "callout":
            return (
              <div key={k} className="callout">
                {b.title && <b>{b.title}</b>}
                {b.text.map((t, j) => <Fragment key={j}><p>{inline(t, j)}</p></Fragment>)}
              </div>
            );
        }
      })}
    </>
  );
}
