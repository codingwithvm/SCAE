"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Timer } from "lucide-react";
import {
  MOCK_CLASSES,
  getProfileDistribution,
  PROFILE_BAR_COLORS,
} from "@/lib/teacher/classes";
import { PROFILE_DATA } from "@/lib/quiz/profile-data";
import { type ProfileName } from "@/lib/quiz/profile";

const PROFILE_ORDER: ProfileName[] = [
  "Criativo",
  "Analítico",
  "Estrategista",
  "Prático",
];

export default function ClassProfilesPage() {
  const params = useParams();
  const classId = Number(params.id);
  const turma = MOCK_CLASSES.find((c) => c.id === classId);

  if (!turma) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Turma não encontrada.
        </p>
        <Link
          href="/teacher/dashboard"
          className="text-sm font-medium text-primary no-underline"
        >
          Voltar ao dashboard
        </Link>
      </div>
    );
  }

  const distribution = getProfileDistribution(turma.students);
  const assessedCount = turma.assessedStudents;
  const pendingStudents = turma.students.filter((s) => s.profile === null);
  const pendingCount = pendingStudents.length;
  const pendingPercent = Math.round((pendingCount / turma.totalStudents) * 100);
  const assessedPercent = Math.round(
    (assessedCount / turma.totalStudents) * 100,
  );

  const maxCount = Math.max(
    ...PROFILE_ORDER.map((p) => distribution[p].length),
    1,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href={`/teacher/classes/${turma.id}`}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline w-fit"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Voltar para turma
      </Link>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Distribuição de perfis
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {turma.name} — {turma.grade}
        </p>
      </div>

      {/* Top row: chart card + summary metrics */}
      <div className="flex gap-6">
        {/* Chart card */}
        <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-border-light bg-background p-6">
          <p className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Perfis da turma
          </p>

          <div className="flex flex-col gap-4">
            {PROFILE_ORDER.map((profileName) => {
              const students = distribution[profileName];
              const count = students.length;
              const percent =
                assessedCount > 0
                  ? Math.round((count / turma.totalStudents) * 100)
                  : 0;
              const barWidth =
                maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
              const profileData = PROFILE_DATA[profileName];
              const barColor = PROFILE_BAR_COLORS[profileName];

              return (
                <div key={profileName} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold font-(family-name:--font-inter)]"
                        style={{
                          backgroundColor: profileData.badgeBg,
                          color: profileData.badgeText,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: profileData.color }}
                          aria-hidden="true"
                        />
                        {profileName}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                      {count} alunos ({percent}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-sm bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary metrics column */}
        <div className="flex flex-col gap-4 w-70 shrink-0">
          <div className="flex flex-col justify-center gap-1 rounded-xl border border-border-light bg-background px-5 py-4 h-20">
            <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
              Total de alunos
            </span>
            <span className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
              {turma.totalStudents}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-1 rounded-xl border border-border-light bg-background px-5 py-4 h-25">
            <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
              Avaliados
            </span>
            <span className="text-3xl font-bold text-success font-(family-name:--font-poppins)]">
              {assessedCount}
            </span>
            <span className="text-xs text-text-muted font-(family-name:--font-inter)]">
              {assessedPercent}% da turma
            </span>
          </div>

          <div className="flex flex-col justify-center gap-1 rounded-xl border border-border-light bg-background px-5 py-4 h-25">
            <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
              Pendentes
            </span>
            <span className="text-3xl font-bold text-warning font-(family-name:--font-poppins)]">
              {pendingCount}
            </span>
            <span className="text-xs text-text-muted font-(family-name:--font-inter)]">
              {pendingPercent}% da turma
            </span>
          </div>
        </div>
      </div>

      {/* Group section: alunos por perfil */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Alunos por perfil
        </h2>

        <div className="flex flex-col gap-4">
          {/* Profile groups — 2 per row */}
          <div className="grid grid-cols-2 gap-4">
            {PROFILE_ORDER.map((profileName) => {
              const students = distribution[profileName];
              const profileData = PROFILE_DATA[profileName];
              const visibleNames = students
                .slice(0, 2)
                .map((s) => s.name.split(" ").slice(0, 2).join(" "));
              const extra = students.length - visibleNames.length;
              const nameList =
                extra > 0
                  ? [...visibleNames, `+${extra}`].join(", ")
                  : visibleNames.join(", ") || "—";

              return (
                <div
                  key={profileName}
                  className="flex flex-col gap-2 rounded-xl border border-border-light bg-background p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold font-(family-name:--font-inter)]"
                      style={{
                        backgroundColor: profileData.badgeBg,
                        color: profileData.badgeText,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: profileData.color }}
                        aria-hidden="true"
                      />
                      {profileName}
                    </span>
                    <span className="text-xs font-medium text-text-secondary font-(family-name:--font-inter)]">
                      {students.length} alunos
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-(family-name:--font-inter)] leading-relaxed">
                    {nameList}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pending group */}
          <div className="flex items-center gap-3 rounded-xl border border-border-light bg-background p-4 flex-wrap">
            <Timer
              size={16}
              className="text-warning shrink-0"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-warning font-(family-name:--font-inter)]">
              Pendentes
            </span>
            <span className="text-xs font-medium text-text-secondary font-(family-name:--font-inter)]">
              {pendingCount} alunos
            </span>
            <span className="text-xs text-text-muted font-(family-name:--font-inter)]">
              {pendingStudents
                .slice(0, 2)
                .map((s) => s.name.split(" ").slice(0, 2).join(" "))
                .concat(pendingCount > 2 ? [`+${pendingCount - 2}`] : [])
                .join(", ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
