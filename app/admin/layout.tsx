import type { Metadata } from "next";
import Shell, { type NavItem } from "@/components/app/Shell";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const NAV: NavItem[] = [
  { href: "/admin", label: "Prezentare", icon: "chart" },
  { href: "/admin/clienti", label: "Clienți", icon: "users" },
  { href: "/admin/incasari", label: "Încasări", icon: "card" },
  { href: "/admin/lansari", label: "Lansări", icon: "star" },
  { href: "/admin/cereri", label: "Cereri", icon: "inbox" },
  { href: "/admin/reduceri", label: "Reduceri", icon: "card" },
  { href: "/admin/setari", label: "Setări", icon: "building" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  const email = s.user!.email ?? "";
  return (
    <Shell items={NAV} badge="Admin" who={{ initial: email.charAt(0).toUpperCase(), name: email.split("@")[0], sub: "Owner" }}>
      {children}
    </Shell>
  );
}
