import { getPortalData } from "@/lib/portal-data";
import { ADDONS, type AddonCode } from "@/lib/plans";
import AddonCard from "@/components/app/AddonCard";

const DESC: Record<AddonCode, string> = {
  local: "Profil Google Business optimizat lunar: postări, poze, răspunsuri la recenzii și date corecte. Apari mai sus în Google Maps și în căutările din zona ta.",
  lang: "Website-ul tradus și menținut într-o limbă în plus (engleză, maghiară, germană etc.), cu SEO pe limba respectivă și selector de limbă.",
  brand: "Logo, paletă de culori, fonturi și un mini-ghid de brand, folosite unitar pe website și pe social media. Se plătește 12 luni.",
};

export default async function AddonsPage() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const cur = d.currency;
  const active = new Set((d.items ?? []).map((i: { addon: string }) => i.addon));
  const canBuy = d.ctx.role === "owner" && Boolean(d.sub && ["active", "past_due"].includes(d.sub.status));
  return (
    <div>
      <div className="topbar"><div><h1>Opțiuni</h1><p>Activezi singur ce ai nevoie. Opțiunea pornește de la rata următoare și apare în calendarul de plăți.</p></div></div>
      <div className="g g-3">
        {(Object.keys(ADDONS) as AddonCode[]).map((k) => (
          <AddonCard key={k} code={k} name={ADDONS[k].name} desc={DESC[k]} price={cur === "EUR" ? ADDONS[k].eur : ADDONS[k].ron} unit={cur === "EUR" ? "€" : "lei"} active={active.has(k)} canBuy={canBuy} maxQty={ADDONS[k].maxQty} />
        ))}
      </div>
    </div>
  );
}
