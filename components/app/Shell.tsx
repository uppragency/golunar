"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>,
  doc: <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h7M9 17h5" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" /></>,
  building: <path d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M16 9h2a2 2 0 012 2v10M8 7h4M8 11h4M8 15h4" />,
  shield: <><path d="M9 12l2 2 4-4" /><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></>,
  chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></>,
  users: <><circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0114 0M16 4a4 4 0 010 8M22 21a7 7 0 00-4-6.3" /></>,
  star: <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />,
  inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></>,
  out: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
};

export type NavItem = { href: string; label: string; short?: string; icon: keyof typeof ICONS };

export function Icon({ name }: { name: keyof typeof ICONS }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{ICONS[name]}</svg>;
}

export default function Shell({ items, who, badge, banner, children }: {
  items: NavItem[];
  who: { initial: string; name: string; sub: string };
  badge?: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isOn = (href: string) => (href === items[0].href ? path === href : path.startsWith(href));
  return (
    <>
      {banner}
      <div className="app">
        <aside className="side">
          <Link href="/" className="logo"><i />LUNAR{badge && <span className="pill" style={{ marginLeft: 4 }}>{badge}</span>}</Link>
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={isOn(i.href) ? "on" : ""} aria-current={isOn(i.href) ? "page" : undefined}>
              <Icon name={i.icon} />{i.label}
            </Link>
          ))}
          <div className="sp" />
          <Link href="/parola-noua"><Icon name="shield" />Parolă</Link>
          <form action="/auth/signout" method="post">
            <button className="logout" type="submit"><Icon name="out" />Ieșire</button>
          </form>
          <div className="who"><i>{who.initial}</i><div>{who.name}<small>{who.sub}</small></div></div>
        </aside>
        <main className="main">
          <nav className="mobtabs" aria-label="Navigare">
            {items.map((i) => (
              <Link key={i.href} href={i.href} className={isOn(i.href) ? "on" : ""}>{i.short ?? i.label}</Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </>
  );
}
