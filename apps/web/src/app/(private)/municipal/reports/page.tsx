"use client";

import { useState } from "react";
import {
  FileText,
  Table,
  GraduationCap,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  MOCK_MUNICIPAL_SCHOOLS,
  MUNICIPAL_PROFILE_DISTRIBUTION,
  getMunicipalMetrics,
  MUNICIPALITY_NAME,
} from "@/lib/municipal/data";

const PROFILE_BAR_COLOR = (pct: number) => {
  if (pct >= 80) return "bg-success";
  if (pct >= 60) return "bg-warning";
  return "bg-error";
};

const maxProfile = Math.max(...Object.values(MUNICIPAL_PROFILE_DISTRIBUTION));

export default function MunicipalReportsPage() {
  const [schoolFilter, setSchoolFilter] = useState("");
  const metrics = getMunicipalMetrics();

  const displayedSchools = schoolFilter
    ? MOCK_MUNICIPAL_SCHOOLS.filter((s) => s.id === schoolFilter)
    : MOCK_MUNICIPAL_SCHOOLS.slice(0, 4);

  const totalAssessed = Math.round(
    (metrics.totalStudents * metrics.assessedStudentsPct) / 100,
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Relatórios do município
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {MUNICIPALITY_NAME}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
            Escola
          </label>
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="h-10 px-3 w-70 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer"
          >
            <option value="">Todas as escolas</option>
            {MOCK_MUNICIPAL_SCHOOLS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
            Período
          </label>
          <select className="h-10 px-3 w-40 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer">
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
      </div>

      {/* YLPHL — Visão geral */}
      <div className="flex flex-col gap-4 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Visão geral do município
        </h2>
        <div className="flex items-start gap-8">
          <OverviewMetric
            icon={GraduationCap}
            iconClass="text-primary"
            value={String(metrics.totalStudents)}
            label="Total de alunos"
          />
          <OverviewMetric
            icon={ClipboardCheck}
            iconClass="text-success"
            value={`${totalAssessed} (${metrics.assessedStudentsPct}%)`}
            label="Alunos avaliados"
          />
          <OverviewMetric
            icon={Sparkles}
            iconClass="text-warning"
            value={String(metrics.gscaeActivities)}
            label="Atividades concluídas"
          />
        </div>
      </div>

      {/* 79pti — Participação por escola */}
      <div className="flex flex-col gap-3 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Participação por escola
        </h2>
        <div className="flex flex-col gap-3">
          {displayedSchools.map((school) => (
            <div key={school.id} className="flex items-center gap-3">
              <span className="w-48 shrink-0 text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                {school.name}
              </span>
              <div className="flex-1 h-4 rounded-full bg-surface overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${PROFILE_BAR_COLOR(school.participationPct)}`}
                  style={{ width: `${school.participationPct}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-semibold text-text-primary font-(family-name:--font-inter)]">
                {school.participationPct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* fzTT3 — two col: distribuição + perfis por escola */}
      <div className="grid grid-cols-2 gap-6">
        {/* distCard26 — Distribuição de perfis, barras pretas */}
        <div className="flex flex-col gap-3 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Distribuição de perfis
          </h2>
          <div className="flex flex-col gap-2">
            {Object.entries(MUNICIPAL_PROFILE_DISTRIBUTION).map(
              ([profile, pct]) => (
                <div key={profile} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-xs font-medium text-text-primary font-(family-name:--font-inter)]">
                    {profile}
                  </span>
                  <div className="flex-1 h-3.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-text-primary transition-all"
                      style={{ width: `${(pct / maxProfile) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
                    {pct}%
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* stackedCard — Perfis por escola, label acima da barra, legenda com bolinhas pretas */}
        <div className="flex flex-col gap-3 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Perfis por escola
          </h2>
          <div className="flex flex-col gap-2.5">
            {displayedSchools.map((school) => {
              const total = Object.values(
                MUNICIPAL_PROFILE_DISTRIBUTION,
              ).reduce((a, b) => a + b, 0);
              return (
                <div key={school.id} className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-text-primary font-(family-name:--font-inter)]">
                    {school.name}
                  </span>
                  <div className="flex h-4 rounded-lg overflow-hidden">
                    {Object.entries(MUNICIPAL_PROFILE_DISTRIBUTION).map(
                      ([profile, pct], idx) => (
                        <div
                          key={profile}
                          title={`${profile}: ${pct}%`}
                          className={idx > 0 ? "border-l border-white/30" : ""}
                          style={{
                            width: `${(pct / total) * 100}%`,
                            backgroundColor: "#000000",
                            opacity: 0.7 + idx * 0.1,
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Legend — bolinhas pretas */}
          <div className="flex items-center gap-4 flex-wrap pt-1">
            {Object.keys(MUNICIPAL_PROFILE_DISTRIBUTION).map((profile) => (
              <div key={profile} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />
                <span className="text-xs text-text-secondary font-(family-name:--font-inter)]">
                  {profile}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 0A0yw — Export */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileText size={16} aria-hidden="true" />
          Exportar PDF
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Table size={16} aria-hidden="true" />
          Exportar CSV
        </Button>
      </div>
    </div>
  );
}

function OverviewMetric({
  icon: Icon,
  iconClass,
  value,
  label,
}: {
  icon: React.ElementType;
  iconClass: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <Icon size={24} className={iconClass} aria-hidden="true" />
      <span className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
        {value}
      </span>
      <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
        {label}
      </span>
    </div>
  );
}
