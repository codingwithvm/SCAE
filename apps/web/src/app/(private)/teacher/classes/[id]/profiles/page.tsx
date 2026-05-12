"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PROFILE_DATA } from "@/lib/quiz/profile-data";
import { type ProfileName } from "@/lib/quiz/profile";

const PROFILE_ORDER: ProfileName[] = [
  "Criativo",
  "Analítico",
  "Estrategista",
  "Prático",
];

const BAR_COLORS: Record<string, string> = {
  Criativo: "#FF6B35",
  Analítico: "#1E4FAE",
  Estrategista: "#059669",
  Prático: "#7C3AED",
};

interface StudentRow {
  studentId: string;
  studentName: string;
  profile: string | null;
  tier: string | null;
  tierLabel: string | null;
  tierColor: string | null;
  profileColor: string | null;
}

export default function ClassProfilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classId } = use(params);
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`/api/v1/classes/${classId}/assessments`, { headers }),
      fetch(`/api/v1/classes/${classId}`, { headers }),
    ])
      .then(async ([studentsRes, classRes]) => {
        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setStudents(data.students || []);
        }
        if (classRes.ok) {
          const data = await classRes.json();
          setClassName(data.name || "");
        }
      })
      .finally(() => setLoading(false));
  }, [classId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const assessed = students.filter((s) => s.profile !== null);
  const pending = students.length - assessed.length;

  const distribution: Record<string, number> = {};
  for (const p of PROFILE_ORDER) distribution[p] = 0;
  for (const s of assessed) {
    if (s.profile && s.profile in distribution) {
      distribution[s.profile]++;
    }
  }

  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Perfis da turma {className}
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {assessed.length} avaliados de {students.length} alunos
          {pending > 0 && ` · ${pending} pendentes`}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-surface border border-border-light px-4 py-3">
          <span className="text-2xl font-bold text-text-primary">
            {students.length}
          </span>
          <span className="text-sm text-text-secondary">Total</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface border border-border-light px-4 py-3">
          <span className="text-2xl font-bold text-primary">
            {assessed.length}
          </span>
          <span className="text-sm text-text-secondary">Avaliados</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface border border-border-light px-4 py-3">
          <span className="text-2xl font-bold text-amber-600">{pending}</span>
          <span className="text-sm text-text-secondary">Pendentes</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border-light bg-background p-6">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)] mb-4">
          Distribuição de perfis
        </h2>

        {assessed.length === 0 ? (
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Nenhuma avaliação concluída ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {PROFILE_ORDER.map((profile) => {
              const count = distribution[profile] || 0;
              const pct =
                assessed.length > 0
                  ? Math.round((count / assessed.length) * 100)
                  : 0;
              const barWidth = Math.round((count / maxCount) * 100);
              const data = PROFILE_DATA[profile];

              return (
                <div key={profile} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                    {profile}
                  </div>
                  <div className="flex-1 h-7 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center px-3 transition-all"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor:
                          BAR_COLORS[profile] || data?.color || "#94a3b8",
                        minWidth: count > 0 ? "40px" : "0",
                      }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                          {count} ({pct}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {assessed.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-background p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)] mb-4">
            Alunos por perfil
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {PROFILE_ORDER.map((profile) => {
              const profileStudents = assessed.filter(
                (s) => s.profile === profile,
              );
              if (profileStudents.length === 0) return null;

              return (
                <div
                  key={profile}
                  className="rounded-xl border border-border-light p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: BAR_COLORS[profile] || "#94a3b8",
                      }}
                    />
                    <span className="text-sm font-semibold text-text-primary">
                      {profile}
                    </span>
                    <span className="text-xs text-text-muted ml-auto">
                      {profileStudents.length} alunos
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {profileStudents.map((s) => (
                      <div
                        key={s.studentId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-text-secondary truncate">
                          {s.studentName}
                        </span>
                        {s.tierLabel && (
                          <span
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor:
                                (s.tierColor || "#94a3b8") + "15",
                              color: s.tierColor || "#94a3b8",
                            }}
                          >
                            {s.tierLabel}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
