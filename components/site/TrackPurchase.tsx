"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** Conversie „comandă plasată”, o singură dată per comandă (fără dubluri la reîncărcare). */
export default function TrackPurchase({ id, value, monthly, currency, plan }: { id: string; value: number; monthly: number; currency: string; plan: string }) {
  useEffect(() => {
    const key = `lunar_tracked_${id}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch {}
    track("purchase", {
      transaction_id: id, value: monthly * 12, currency, first_payment: value, monthly, plan,
      ecommerce: { transaction_id: id, value: monthly * 12, currency, items: [{ item_id: plan, item_name: `Abonament ${plan}`, price: monthly, quantity: 12 }] },
    });
  }, [id, value, monthly, currency, plan]);
  return null;
}
