"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherMeesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/assessment/mees_prof");
  }, [router]);

  return null;
}
