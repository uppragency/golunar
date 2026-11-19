import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Shell, { type NavItem } from "@/components/app/Shell";
import { getPortalData } from "@/lib/portal-data";
import { clearViewAs } from "@/app/admin/actions";
import PayGate from "@/components/app/PayGate";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Portal client", robots: { index: false } };

const NAV: NavItem[] = [
  { href: "/cont", label: "Prezentare", icon: "home" },
  { href: "/cont/brief", label: "Brief", icon: "pen" },
  { href: "/cont/website", label: "Website", icon: "globe" },
  { href: "/cont/plati", label: "Plăți și facturi", short: "Plăți", icon: "doc" },
  { href: "/cont/metode", label: "Metode de plată", short: "Metode", icon: "card" },
  { href: "/cont/facturare", label: "Date facturare", short: "Facturare", icon: "building" },
  { href: "/cont/documente", label: "Contract și documente", short: "Contract", icon: "shield" },
  { href: "/cont/cereri", label: "Cereri și suport", short: "Cereri", icon: "chat" },
  { href: "/cont/recomanda", label: "Recomandă și câștigă", short: "Recomandă", icon: "star" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const d = await getPortalData();
  if (!d.ready && d.ctx.isAdmin) redirect("/admin");
  if (!d.ready) {
    return (
      <main className="auth-wrap dots">
        <div className="auth-card">
          <Link href="/" className="logo"><i />LUNAR</Link>
          <h1>Niciun abonament</h1>
          <p>Adresa {d.ctx.user?.email} nu este asociată cu un abonament LUNAR. Dacă ai comandat cu altă adresă, autentifică-te cu aceea.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {d.ctx.isAdmin && <Link href="/admin" className="btn-plain">Mergi în admin</Link>}
            <Link href="/#abonamente" className="btn-plain">Vezi abonamentele</Link>
            <form action="/auth/signout" method="post"><button className="btn-plain">Ieșire</button></form>
          </div>
        </div>
      </main>
    );
  }
  const payBanner = d.awaitingPayment ? (
    <div className="demo-bar pay-bar">
      <span>Contul se activează după confirmarea primei plăți{d.firstDue ? ` (comanda ${d.company.bank_reference}, de plată ${money(d.firstDue.amount_net, d.currency)})` : ""}.</span>
      <Link href="/cont" className="btn-plain sm" style={{ color: "inherit" }}>Datele de plată</Link>
    </div>
  ) : null;
  const banner = d.ctx.viewingAsAdmin ? (
    <div className="demo-bar">
      <span>Vizualizezi portalul ca <b>{d.company.name}</b>{d.company.is_demo ? " · date demo" : ""}</span>
      <form action={clearViewAs}><button className="btn-plain sm" style={{ color: "inherit" }}>Înapoi în admin</button></form>
    </div>
  ) : payBanner;
  return (
    <Shell items={NAV} banner={banner} who={{ initial: d.company.name.charAt(0), name: d.company.name, sub: `Plan ${d.planName}` }}>
      <PayGate locked={d.awaitingPayment}>{children}</PayGate>
    </Shell>
  );
}
