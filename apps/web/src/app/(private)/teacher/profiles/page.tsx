"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { type ProfileName } from "@/lib/quiz/profile";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

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

interface ClassItem {
  id: string;
  name: string;
}

interface StudentRow {
  studentId: string;
  studentName: string;
  profile: string | null;
  tier: string | null;
  tierLabel: string | null;
  tierColor: string | null;
  profileColor: string | null;
  className: string;
  classId: string;
}

export default function TeacherProfilesPage() {
  const router = useRouter();
  const [allStudents, setAllStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedProfile, setSelectedProfile] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    fetch("/api/v1/classes/my", { headers })
      .then((r) => r.json())
      .then(async (data) => {
        const fetchedClasses = (data.classes || []) as ClassItem[];
        setClasses(fetchedClasses);

        const students: StudentRow[] = [];

        await Promise.all(
          fetchedClasses.map(async (c) => {
            const res = await fetch(`/api/v1/classes/${c.id}/assessments`, {
              headers,
            });
            if (res.ok) {
              const json = await res.json();
              const rows = (json.students || []) as Omit<
                StudentRow,
                "className" | "classId"
              >[];
              rows.forEach((s) => {
                students.push({ ...s, className: c.name, classId: c.id });
              });
            }
          }),
        );

        students.sort((a, b) => a.studentName.localeCompare(b.studentName));
        setAllStudents(students);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const studentOptions = useMemo(
    () => [
      { value: "all", label: "Todos os alunos" },
      ...allStudents.map((s) => ({
        value: s.studentId,
        label: s.studentName,
        sublabel: s.className,
      })),
    ],
    [allStudents],
  );

  const classOptions = useMemo(
    () => [
      { value: "all", label: "Todas as turmas" },
      ...classes.map((c) => ({ value: c.id, label: c.name })),
    ],
    [classes],
  );

  const profileOptions = useMemo(
    () => [
      { value: "all", label: "Todos os perfis" },
      ...PROFILE_ORDER.map((p) => ({ value: p, label: p })),
    ],
    [],
  );

  const filteredStudents = useMemo(() => {
    let result = allStudents;

    if (selectedClass !== "all") {
      result = result.filter((s) => s.classId === selectedClass);
    }

    if (selectedProfile !== "all") {
      result = result.filter((s) => s.profile === selectedProfile);
    }

    if (selectedStudentId !== "all") {
      result = result.filter((s) => s.studentId === selectedStudentId);
    }

    return result;
  }, [allStudents, selectedClass, selectedProfile, selectedStudentId]);

  const distribution = useMemo(() => {
    const assessed = filteredStudents.filter((s) => s.profile !== null);
    const dist: Record<string, number> = {};
    for (const p of PROFILE_ORDER) dist[p] = 0;
    for (const s of assessed) {
      if (s.profile && s.profile in dist) dist[s.profile]++;
    }
    return dist;
  }, [filteredStudents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const assessed = filteredStudents.filter((s) => s.profile !== null);
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Perfis dos Alunos
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Visualize e filtre os perfis de aprendizagem dos seus alunos.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchableSelect
          options={studentOptions}
          value={selectedStudentId}
          onChange={setSelectedStudentId}
          placeholder="Buscar aluno..."
          className="min-w-[220px] max-w-[320px]"
        />

        <SearchableSelect
          options={classOptions}
          value={selectedClass}
          onChange={(v) => {
            setSelectedClass(v);
            setSelectedStudentId("all");
          }}
          placeholder="Filtrar turma..."
          className="min-w-[180px]"
        />

        <SearchableSelect
          options={profileOptions}
          value={selectedProfile}
          onChange={setSelectedProfile}
          placeholder="Filtrar perfil..."
          className="min-w-[180px]"
        />
      </div>

      {assessed.length > 0 && (
        <div className="rounded-2xl border border-border-light bg-background p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)] mb-4">
            Distribuição de perfis
          </h2>
          <div className="flex flex-col gap-2">
            {PROFILE_ORDER.map((profile) => {
              const count = distribution[profile] || 0;
              const pct =
                assessed.length > 0
                  ? Math.round((count / assessed.length) * 100)
                  : 0;
              const barWidth = Math.round((count / maxCount) * 100);

              return (
                <div key={profile} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                    {profile}
                  </div>
                  <div className="flex-1 h-6 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center px-2.5 transition-all"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: BAR_COLORS[profile] || "#94a3b8",
                        minWidth: count > 0 ? "36px" : "0",
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
        </div>
      )}

      <div className="rounded-2xl border border-border-light bg-background overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Alunos ({filteredStudents.length})
          </h2>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-text-muted font-(family-name:--font-inter)]">
              Nenhum aluno encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light bg-surface">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide font-(family-name:--font-inter)]">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide font-(family-name:--font-inter)]">
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide font-(family-name:--font-inter)]">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide font-(family-name:--font-inter)]">
                    Nível
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={`${student.studentId}-${student.classId}`}
                    className="border-b border-border-light last:border-b-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-text-primary font-(family-name:--font-inter)]">
                      {student.studentName}
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary font-(family-name:--font-inter)]">
                      {student.className}
                    </td>
                    <td className="px-6 py-3">
                      {student.profile ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-medium"
                          style={{
                            color: BAR_COLORS[student.profile] || "#64748b",
                          }}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                BAR_COLORS[student.profile] || "#64748b",
                            }}
                          />
                          {student.profile}
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {student.tierLabel ? (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              (student.tierColor || "#94a3b8") + "15",
                            color: student.tierColor || "#94a3b8",
                          }}
                        >
                          {student.tierLabel}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
