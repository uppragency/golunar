import type { Metadata } from "next";
import Shell, { type NavItem } from "@/components/app/Shell";
import { requireAdmin } from "@/lib/session";
import AdminVisit from "@/components/app/AdminVisit";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

const NAV: NavItem[] = [
  { href: "/admin", label: "Prezentare", icon: "chart" },
  { href: "/admin/comenzi", label: "Comenzi", icon: "doc" },
  { href: "/admin/lansari", label: "Producție", icon: "star" },
  { href: "/admin/saptamana", label: "Săptămâna", icon: "inbox" },
  { href: "/admin/calendar", label: "Calendar", icon: "doc" },
  { href: "/admin/clienti", label: "Clienți", icon: "users" },
  { href: "/admin/cereri", label: "Cereri", icon: "inbox" },
  { href: "/admin/lead-uri", label: "Lead-uri", icon: "chat" },
  { href: "/admin/mesaje", label: "Mesaje", icon: "globe" },
  { href: "/admin/incasari", label: "Încasări", icon: "card" },
  { href: "/admin/tehnic", label: "Tehnic", icon: "shield" },
  { href: "/admin/reduceri", label: "Reduceri", icon: "pen" },
  { href: "/admin/setari", label: "Setări", icon: "building" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  const email = s.user!.email ?? "";
  return (
    <Shell items={NAV} badge="Admin" who={{ initial: email.charAt(0).toUpperCase(), name: email.split("@")[0], sub: "Owner" }}>
      <AdminVisit />
      {children}
    </Shell>
  );
}
