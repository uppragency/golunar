"use client";

import { useActionState } from "react";
import { Feedback } from "./forms";

type State = { ok?: string; error?: string } | null;

export default function InviteForm({ action, companyId }: { action: (s: State, f: FormData) => Promise<State>; companyId: string }) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form action={run}>
      <input type="hidden" name="company_id" value={companyId} />
      <div className="inline-form">
        <input name="email" type="email" required placeholder="email@firma.ro" style={{ flex: 1, minWidth: 180 }} />
        <select name="role" defaultValue="owner"><option value="owner">Owner</option><option value="billing">Billing</option><option value="viewer">Viewer</option></select>
        <button className="btn-plain sm" disabled={pending}>{pending ? "…" : "Dă acces"}</button>
      </div>
      <Feedback state={state} />
    </form>
  );
}
