"use client";

import Link from "next/link";
import {
  School,
  Users,
  UserCheck,
  GraduationCap,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import {
  getMunicipalMetrics,
  MUNICIPAL_PROFILE_DISTRIBUTION,
  MOCK_MUNICIPAL_SCHOOLS,
  MUNICIPALITY_NAME,
  MUNICIPAL_MANAGER_NAME,
} from "@/lib/municipal/data";

const PARTICIPATION_COLOR = (pct: number) => {
  if (pct >= 80) return "text-success";
  if (pct >= 60) return "text-warning";
  return "text-error";
};

export default function MunicipalDashboardPage() {
  const metrics = getMunicipalMetrics();
  const maxProfile = Math.max(...Object.values(MUNICIPAL_PROFILE_DISTRIBUTION));

  const metricRows = [
    [
      { label: "Escolas", value: String(metrics.totalSchools), icon: School },
      { label: "Turmas", value: String(metrics.totalClasses), icon: Users },
      {
        label: "Professores",
        value: String(metrics.totalTeachers),
        icon: UserCheck,
      },
    ],
    [
      {
        label: "Alunos",
        value: String(metrics.totalStudents),
        icon: GraduationCap,
      },
      {
        label: "Alunos avaliados",
        value: `${metrics.assessedStudentsPct}%`,
        icon: ClipboardCheck,
      },
      {
        label: "Atividades GSCAE",
        value: String(metrics.gscaeActivities),
        icon: Sparkles,
      },
    ],
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Olá, {MUNICIPAL_MANAGER_NAME.split(" ")[0]}!
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {MUNICIPALITY_NAME}
        </p>
      </div>

      {/* Metrics grid — 2 rows × 3 cols, ícone acima do valor */}
      <div className="flex flex-col gap-4">
        {metricRows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-3 gap-4">
            {row.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col gap-3 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] px-6 py-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cta shrink-0">
                  <Icon
                    size={20}
                    className="text-primary-dark"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                    {value}
                  </span>
                  <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Distribuição de perfis — full width, barras pretas */}
      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Distribuição de perfis do município
        </h2>
        <div className="flex flex-col gap-3">
          {Object.entries(MUNICIPAL_PROFILE_DISTRIBUTION).map(
            ([profile, pct]) => (
              <div key={profile} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                  {profile}
                </span>
                <div className="flex-1 h-5 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-text-primary transition-all"
                    style={{ width: `${(pct / maxProfile) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-text-secondary font-(family-name:--font-inter)]">
                  {pct}%
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Participação por escola — full width */}
      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Participação por escola
        </h2>
        <div className="flex flex-col gap-2">
          {MOCK_MUNICIPAL_SCHOOLS.map((school, idx) => (
            <div
              key={school.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface"
            >
              <span className="w-5 text-sm font-bold text-primary font-(family-name:--font-inter)]">
                {idx + 1}.
              </span>
              <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                {school.name}
              </span>
              <span
                className={[
                  "text-sm font-bold font-(family-name:--font-inter)]",
                  PARTICIPATION_COLOR(school.participationPct),
                ].join(" ")}
              >
                {school.participationPct}%
              </span>
            </div>
          ))}
        </div>
        <Link
          href="/municipal/schools"
          className="text-sm font-medium text-primary hover:opacity-75 transition-opacity self-start"
        >
          Ver todas as escolas →
        </Link>
      </div>
    </div>
  );
}
