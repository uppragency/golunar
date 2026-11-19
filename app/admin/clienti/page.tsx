import Link from "next/link";
import { getOps } from "@/lib/admin-ops";
import ClientsTable from "@/components/app/ClientsTable";
import { Plus } from "@/components/site/visuals";

export default async function ClientsPage() {
  const d = await getOps();
  const c = d.clients;
  return (
    <div>
      <div className="topbar">
        <div><h1>Clienți</h1><p>{d.active.length} activi · {c.filter((x) => x.status === "Lansare").length} în lansare · {c.filter((x) => x.ownerDone).length} proprietari</p></div>
        <Link href="/admin/clienti/nou" className="btn btn-accent"><span className="ic"><Plus /></span>Client nou</Link>
      </div>
      <ClientsTable rows={c} impr={Object.fromEntries(d.improvements)} tags={Object.fromEntries([...d.company.values()].map((x) => [x.id, (x.tags as string[]) ?? []]))} health={Object.fromEntries(d.health)} />
    </div>
  );
}
