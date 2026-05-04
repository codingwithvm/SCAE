"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ActivityHistoryPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/activities");
  }, [router]);
  return null;
}
