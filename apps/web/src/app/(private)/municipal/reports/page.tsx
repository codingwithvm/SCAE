"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MunicipalReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalSchools, setTotalSchools] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/v1/schools?perPage=1", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setTotalSchools(data.total || 0))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Relatórios Municipais
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Visão geral do município
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2 bg-background rounded-2xl border border-border-light p-6">
          <span className="text-3xl font-bold text-text-primary">
            {totalSchools}
          </span>
          <span className="text-sm text-text-secondary">
            Escolas cadastradas
          </span>
        </div>
      </div>

      <p className="text-sm text-text-muted font-(family-name:--font-inter)]">
        Relatórios detalhados com métricas por escola serão disponibilizados em
        breve.
      </p>
    </div>
  );
}
