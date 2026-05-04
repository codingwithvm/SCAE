"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ActivityDetailPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/activities");
  }, [router]);
  return null;
}
