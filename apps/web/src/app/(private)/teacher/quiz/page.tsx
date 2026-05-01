"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherQuizRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/assessment/mcees_prof");
  }, [router]);

  return null;
}
