import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const VIEW_AS_COOKIE = "lunar_company";

export type Membership = { company_id: string; role: "owner" | "billing" | "viewer"; companies: { name: string } | null };

export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { supabase, user: null, isAdmin: false, memberships: [] as Membership[] };
  const [{ data: admin }, { data: memberships }] = await Promise.all([
    supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("members").select("company_id, role, companies(name)").eq("user_id", user.id),
  ]);
  return { supabase, user, isAdmin: Boolean(admin), memberships: (memberships ?? []) as unknown as Membership[] };
});

/** Company shown in the client portal: own membership, or the one an admin chose to view. */
export const getPortalContext = cache(async () => {
  const s = await getSession();
  if (!s.user) redirect("/login?next=/cont");
  const store = await cookies();
  const chosen = store.get(VIEW_AS_COOKIE)?.value;
  let companyId: string | null = null;
  let role: Membership["role"] = "viewer";
  if (chosen && (s.isAdmin || s.memberships.some((m) => m.company_id === chosen))) {
    companyId = chosen;
    role = s.memberships.find((m) => m.company_id === chosen)?.role ?? (s.isAdmin ? "owner" : "viewer");
  } else if (s.memberships[0]) {
    companyId = s.memberships[0].company_id;
    role = s.memberships[0].role;
  }
  const viewingAsAdmin = s.isAdmin && !s.memberships.some((m) => m.company_id === companyId);
  return { ...s, companyId, role, viewingAsAdmin, canEdit: role !== "viewer" };
});

export async function requireAdmin() {
  const s = await getSession();
  if (!s.user) redirect("/login?next=/admin");
  if (!s.isAdmin) redirect("/cont");
  return s;
}
