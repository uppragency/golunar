"use client";

import { deleteDiscount } from "@/app/admin/actions";

/** Ștergere cod de reducere, cu confirmare. Comenzile existente își păstrează reducerea. */
export default function DeleteDiscount({ id, code, used }: { id: string; code: string; used: number }) {
  return (
    <form action={deleteDiscount} onSubmit={(e) => {
      const msg = used ? `Ștergi codul ${code}? A fost folosit de ${used} ori; comenzile existente își păstrează reducerea.` : `Ștergi definitiv codul ${code}?`;
      if (!window.confirm(msg)) e.preventDefault();
    }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="confirm" value="STERGE" />
      <button className="btn-plain sm danger">Șterge</button>
    </form>
  );
}
