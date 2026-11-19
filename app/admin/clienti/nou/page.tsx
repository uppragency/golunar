import NewClientForm from "@/components/app/NewClientForm";
import { createClientAction } from "@/app/admin/actions";

export default function NewClientPage() {
  return (
    <div>
      <div className="topbar"><div><h1>Client nou</h1><p>Creează firma, abonamentul și cele 12 rate. Clientul primește acces în portal pe email.</p></div></div>
      <NewClientForm action={createClientAction} />
    </div>
  );
}
