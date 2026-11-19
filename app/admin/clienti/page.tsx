import Link from "next/link";
import { getAdminData } from "@/lib/admin-data";
import ClientsTable from "@/components/app/ClientsTable";
import { Plus } from "@/components/site/visuals";

export default async function ClientsPage() {
  const d = await getAdminData();
  const c = d.clients;
  return (
    <div>
      <div className="topbar">
        <div><h1>Clienți</h1><p>{d.active.length} activi · {c.filter((x) => x.status === "Lansare").length} în lansare · {c.filter((x) => x.ownerDone).length} proprietari</p></div>
        <Link href="/admin/clienti/nou" className="btn btn-accent"><span className="ic"><Plus /></span>Client nou</Link>
      </div>
      <ClientsTable rows={c} />
    </div>
  );
}
