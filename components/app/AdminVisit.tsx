"use client";

import { useEffect } from "react";
import { recordAdminVisit } from "@/app/admin/actions";

export default function AdminVisit() {
  useEffect(() => { recordAdminVisit().catch(() => {}); }, []);
  return null;
}
