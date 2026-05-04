"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { School, BarChart3, Loader2 } from "lucide-react";

export default function MunicipalDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Gestor(a)");
  const [loading, setLoading] = useState(true);
  const [totalSchools, setTotalSchools] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(stored) as { name?: string };
    if (parsed.name) setUserName(parsed.name.split(" ")[0]);

    const token = localStorage.getItem("auth_token");
    if (!token) return;

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
          Olá, {userName}!
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Painel do Gestor Municipal
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2 bg-background rounded-2xl border border-border-light p-6">
          <School size={24} className="text-primary" />
          <span className="text-3xl font-bold text-text-primary">
            {totalSchools}
          </span>
          <span className="text-sm text-text-secondary">Escolas</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/municipal/schools"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium text-text-primary bg-background hover:bg-surface transition-colors no-underline"
        >
          <School size={16} className="text-text-secondary" />
          Gerenciar escolas
        </Link>
        <Link
          href="/municipal/reports"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium text-text-primary bg-background hover:bg-surface transition-colors no-underline"
        >
          <BarChart3 size={16} className="text-text-secondary" />
          Relatórios
        </Link>
      </div>
    </div>
  );
}
