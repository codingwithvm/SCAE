"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  School,
  Users,
  UserCheck,
  GraduationCap,
  FileText,
  Loader2,
} from "lucide-react";

interface Metric {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/v1/municipalities?perPage=1", { headers }).then((r) =>
        r.json(),
      ),
      fetch("/api/v1/schools?perPage=1", { headers }).then((r) => r.json()),
      fetch("/api/v1/users?role=TEACHER&perPage=1", { headers }).then((r) =>
        r.json(),
      ),
      fetch("/api/v1/users?role=STUDENT&perPage=1", { headers }).then((r) =>
        r.json(),
      ),
      fetch("/api/v1/users?role=SCHOOL_MANAGER&perPage=1", { headers }).then(
        (r) => r.json(),
      ),
    ])
      .then(([muniRes, schoolRes, teacherRes, studentRes, managerRes]) => {
        setMetrics([
          {
            label: "Municípios",
            value: String(muniRes.total || 0),
            icon: Building2,
            href: "/admin/municipalities",
          },
          {
            label: "Escolas",
            value: String(schoolRes.total || 0),
            icon: School,
            href: "/admin/municipalities",
          },
          {
            label: "Gestores",
            value: String(managerRes.total || 0),
            icon: UserCheck,
            href: "/admin/municipalities",
          },
          {
            label: "Professores",
            value: String(teacherRes.total || 0),
            icon: Users,
            href: "/admin/municipalities",
          },
          {
            label: "Alunos",
            value: String(studentRes.total || 0),
            icon: GraduationCap,
            href: "/admin/municipalities",
          },
          {
            label: "Instrumentos",
            value: "4",
            icon: FileText,
            href: "/admin/forms",
          },
        ]);
      })
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
          Painel Administrativo
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Visão geral do sistema SCAE
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col gap-2 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6 no-underline hover:border-primary/30 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
              <Icon
                size={20}
                className="text-primary-dark"
                aria-hidden="true"
              />
            </div>
            <span className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
              {value}
            </span>
            <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
