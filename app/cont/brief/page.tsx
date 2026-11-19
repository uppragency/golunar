import { getPortalData } from "@/lib/portal-data";
import { date } from "@/lib/format";
import { Pill } from "@/components/app/charts";
import BriefForm from "@/components/app/BriefForm";
import { saveBrief } from "@/app/cont/actions";

export default async function BriefPage() {
  const d = await getPortalData();
  if (!d.ready) return null;
  const sent = d.brief?.submitted_at ?? null;
  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Brief</h1>
          <p>Spune-ne despre firma ta și ce site vrei. Durează 5 până la 10 minute. Poți salva și reveni oricând.</p>
        </div>
        <div className="tb-r"><Pill tone={sent ? "ok" : "warn"}>{sent ? `Trimis pe ${date(sent, { day: "numeric", month: "long" })}` : "De completat"}</Pill></div>
      </div>
      <div className="panel brief-tips">
        <ol>
          <li><b>Răspunde scurt</b>, cum i-ai explica unui client nou.</li>
          <li><b>Lasă gol</b> ce nu știi. Completăm noi la discuția de început.</li>
          <li><b>Adaugă exemple și poze</b>. Ne ajută cel mai mult la design.</li>
          <li><b>Apasă „Trimite brief-ul”</b>. Ceasul de 10 zile lucrătoare pornește după plată și brief.</li>
        </ol>
      </div>
      <BriefForm action={saveBrief} companyId={d.company.id} initial={d.brief} submittedAt={sent} disabled={!d.ctx.canEdit} />
    </div>
  );
}
