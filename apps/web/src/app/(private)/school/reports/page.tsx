"use client";

import { useState } from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  getProfileDistribution,
  MOCK_CLASSES,
  SCHOOL_NAME,
} from "@/lib/school/data";

const PROFILE_COLORS: Record<string, string> = {
  Criativo: "#F6AD55",
  Analítico: "#63B3ED",
  Estrategista: "#68D391",
  Prático: "#FC8181",
};

const TOTAL_STUDENTS = 200;
const ASSESSED_STUDENTS = 156;
const PARTICIPATION_PCT = Math.round(
  (ASSESSED_STUDENTS / TOTAL_STUDENTS) * 100,
);

export default function SchoolReportsPage() {
  const [classFilter, setClassFilter] = useState("");
  const distribution = getProfileDistribution();
  const totalAssessed = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Relatórios
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {SCHOOL_NAME}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
            Turma
          </label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 px-3 w-55 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer"
          >
            <option value="">Todas as turmas</option>
            {MOCK_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

      {/* Card: Participation */}
      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Taxa de participação nas avaliações
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <span className="text-[48px] font-bold leading-none text-primary font-(family-name:--font-poppins)]">
              {PARTICIPATION_PCT}%
            </span>
            <span className="text-base text-text-secondary font-(family-name:--font-inter)] pb-1">
              dos alunos avaliados
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm font-(family-name:--font-inter)]">
              <span className="text-text-secondary">Participação</span>
              <span className="font-semibold text-primary">
                {PARTICIPATION_PCT}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${PARTICIPATION_PCT}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-text-muted font-(family-name:--font-inter)]">
            {ASSESSED_STUDENTS} de {TOTAL_STUDENTS} alunos
          </span>
        </div>
      </div>

      {/* Card: Profile distribution by class */}
      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Perfis por turma
          </h2>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Distribuição dos perfis cognitivos MCEES por turma
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 flex-wrap">
          {Object.entries(PROFILE_COLORS).map(([profile, color]) => (
            <div key={profile} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-text-secondary font-(family-name:--font-inter)]">
                {profile}
              </span>
            </div>
          ))}
        </div>

        {/* Bars per class */}
        <div className="flex flex-col gap-3">
          {(classFilter
            ? MOCK_CLASSES.filter((c) => c.id === classFilter)
            : MOCK_CLASSES.slice(0, 4)
          ).map((cls) => (
            <div key={cls.id} className="flex items-center gap-3">
              <span className="text-sm text-text-secondary w-20 shrink-0 font-(family-name:--font-inter)]">
                {cls.name}
              </span>
              <div className="flex flex-1 h-5 rounded overflow-hidden">
                {(Object.entries(PROFILE_COLORS) as [string, string][]).map(
                  ([profile, color], idx) => {
                    const count =
                      distribution[profile as keyof typeof distribution] ?? 0;
                    const width =
                      totalAssessed > 0 ? (count / totalAssessed) * 100 : 25;
                    return (
                      <div
                        key={profile}
                        title={`${profile}: ${count}`}
                        className={idx > 0 ? "border-l border-white/20" : ""}
                        style={{ width: `${width}%`, backgroundColor: color }}
                      />
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card: Activity progress */}
      <div className="flex flex-col gap-4 bg-background rounded-2xl border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Progresso nas atividades
          </h2>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Acompanhamento das atividades GSCAE realizadas pelos alunos
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <MetricRow label="Atividades iniciadas" value="428" />
          <MetricRow label="Atividades concluídas" value="312" />
          <MetricRow label="Pontuação média" value="74 pts" />
        </div>
      </div>

      {/* Export actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileText size={16} aria-hidden="true" />
          Exportar PDF
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileSpreadsheet size={16} aria-hidden="true" />
          Exportar CSV
        </Button>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
        {label}
      </span>
      <span className="text-sm font-semibold text-text-primary font-(family-name:--font-inter)]">
        {value}
      </span>
    </div>
  );
}
