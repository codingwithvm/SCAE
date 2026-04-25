"use client";

import Link from "next/link";
import {
  Users,
  UserCheck,
  GraduationCap,
  Percent,
  BarChart3,
} from "lucide-react";
import {
  getSchoolMetrics,
  getProfileDistribution,
  SCHOOL_NAME,
} from "@/lib/school/data";

const PROFILE_COLORS: Record<string, string> = {
  Criativo: "#F6AD55",
  Analítico: "#63B3ED",
  Estrategista: "#68D391",
  Prático: "#FC8181",
};

export default function SchoolDashboardPage() {
  const metrics = getSchoolMetrics();
  const distribution = getProfileDistribution();
  const totalAssessed = Object.values(distribution).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(distribution));

  const metricCards = [
    { label: "Turmas", value: String(metrics.totalClasses), icon: Users },
    {
      label: "Professores",
      value: String(metrics.totalTeachers),
      icon: UserCheck,
    },
    {
      label: "Alunos",
      value: String(metrics.totalStudents),
      icon: GraduationCap,
    },
    {
      label: "Alunos avaliados",
      value: `${metrics.assessedPercent}%`,
      icon: Percent,
    },
  ];

  const quickActions = [
    { label: "Gerenciar turmas", icon: Users, href: "/school/classes" },
    {
      label: "Gerenciar professores",
      icon: UserCheck,
      href: "/school/teachers",
    },
    { label: "Ver relatórios", icon: BarChart3, href: "/school/reports" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Olá, Maria!
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {SCHOOL_NAME}
        </p>
      </div>

      {/* Metrics 2×2 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          {metricCards.slice(0, 2).map(({ label, value, icon: Icon }) => (
            <MetricCard
              key={label}
              label={label}
              value={value}
              icon={
                <Icon
                  size={20}
                  className="text-primary-dark"
                  aria-hidden="true"
                />
              }
            />
          ))}
        </div>
        <div className="flex gap-4">
          {metricCards.slice(2, 4).map(({ label, value, icon: Icon }) => (
            <MetricCard
              key={label}
              label={label}
              value={value}
              icon={
                <Icon
                  size={20}
                  className="text-primary-dark"
                  aria-hidden="true"
                />
              }
            />
          ))}
        </div>
      </div>

      {/* Profile distribution card */}
      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Distribuição de perfis da escola
        </h2>
        {(Object.entries(distribution) as [string, number][]).map(
          ([profile, count]) => (
            <div key={profile} className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-secondary w-24 shrink-0 font-(family-name:--font-inter)]">
                {profile}
              </span>
              <div className="flex-1 h-5 rounded bg-surface overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: maxCount > 0 ? `${(count / maxCount) * 100}%` : "0%",
                    backgroundColor: PROFILE_COLORS[profile] ?? "#63B3ED",
                  }}
                />
              </div>
              <span className="text-sm font-medium text-text-secondary w-20 text-right shrink-0 font-(family-name:--font-inter)]">
                {count} (
                {totalAssessed > 0
                  ? Math.round((count / totalAssessed) * 100)
                  : 0}
                %)
              </span>
            </div>
          ),
        )}
      </div>

      {/* Quick access */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Acesso rápido
        </h2>
        <div className="flex gap-3">
          {quickActions.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium text-text-primary bg-background hover:bg-surface transition-colors no-underline"
            >
              <Icon
                size={16}
                className="text-text-secondary"
                aria-hidden="true"
              />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col gap-2 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta">
        {icon}
      </div>
      <span className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
        {value}
      </span>
      <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
        {label}
      </span>
    </div>
  );
}
