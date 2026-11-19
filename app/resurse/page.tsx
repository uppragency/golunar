import type { Metadata } from "next";
import SubHeader from "@/components/site/SubHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ResourceHub from "@/components/site/ResourceHub";

export const metadata: Metadata = {
  title: "Resurse: ghiduri, instrumente și articole despre website-uri",
  description: "Ghiduri, calculatoare, template-uri și checklist-uri gratuite pentru antreprenorii care aleg între abonament, plată unică sau DIY.",
  alternates: { canonical: "/resurse" },
};

export default function ResourcesPage() {
  return (
    <div id="top">
      <SubHeader />
      <header className="r-hero dots">
        <div className="wrap">
          <div className="eyebrow">Resurse</div>
          <h1>Decide informat. <span className="dim" style={{ color: "var(--mute2)" }}>Gratuit.</span></h1>
          <p className="lede">Ghiduri, instrumente și template-uri pentru antreprenorii care aleg între abonament, plată unică sau DIY. Fără email obligatoriu, fără jargon.</p>
        </div>
      </header>
      <main className="wrap" style={{ paddingBottom: 120 }}>
        <ResourceHub />
      </main>
      <SiteFooter />
    </div>
  );
}
