"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface ClassInfo {
  id: string;
  name: string;
  grade: number;
  year: number;
}

interface StudentAssessment {
  studentId: string;
  studentName: string;
  studentRegistration: string | null;
  assessmentId: string | null;
  instrument: string | null;
  profile: string | null;
  tier: string | null;
  tierLabel: string | null;
  tierColor: string | null;
  profileColor: string | null;
  completedAt: string | null;
}

const PROFILE_COLORS: Record<string, { bg: string; text: string }> = {
  Criativo: { bg: "#FFF5EB", text: "#C05621" },
  Analítico: { bg: "#EBF8FF", text: "#2B6CB0" },
  Estrategista: { bg: "#F0FFF4", text: "#276749" },
  Prático: { bg: "#FFF5F5", text: "#C53030" },
  Facilitador: { bg: "#FAF5FF", text: "#6B46C1" },
  Avaliador: { bg: "#FFF5F7", text: "#B83280" },
  Especialista: { bg: "#E6FFFA", text: "#234E52" },
  Mentor: { bg: "#FFFFF0", text: "#744210" },
  Equilibrado: { bg: "#F7FAFC", text: "#2D3748" },
};

export default function TeacherStudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classFromUrl = searchParams.get("class");
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<StudentAssessment[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/v1/classes/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { classes: [] }))
      .then((data) => {
        setClasses(data.classes || []);
        if (
          classFromUrl &&
          data.classes?.some((c: ClassInfo) => c.id === classFromUrl)
        ) {
          setSelectedClassId(classFromUrl);
        } else if (data.classes?.length > 0) {
          setSelectedClassId(data.classes[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!selectedClassId) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    setLoading(true);
    fetch(`/api/v1/classes/${selectedClassId}/assessments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : { students: [] }))
      .then((data) => setStudents(data.students || []))
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  const filtered = useMemo(() => {
    if (selectedStudentId === "all") return students;
    return students.filter((s) => s.studentId === selectedStudentId);
  }, [students, selectedStudentId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.year})`,
      })),
    [classes],
  );

  const studentOptions = useMemo(
    () => [
      { value: "all", label: "Todos os alunos" },
      ...students.map((s) => ({
        value: s.studentId,
        label: s.studentName,
        sublabel: s.studentRegistration || undefined,
      })),
    ],
    [students],
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Meus Alunos
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          Relatórios de avaliação dos alunos das suas turmas
        </p>
      </div>

      <div className="flex items-center gap-3">
        <SearchableSelect
          options={studentOptions}
          value={selectedStudentId}
          onChange={setSelectedStudentId}
          placeholder="Buscar aluno..."
          className="w-60"
        />

        <SearchableSelect
          options={classOptions}
          value={selectedClassId}
          onChange={(v) => {
            setSelectedClassId(v);
            setSelectedStudentId("all");
          }}
          placeholder="Selecionar turma..."
          className="w-52"
        />

        {selectedClass && (
          <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            {filtered.length} aluno{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-light bg-background py-12">
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            {students.length === 0
              ? "Nenhum aluno matriculado nesta turma."
              : "Nenhum aluno encontrado com esse filtro."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border-light bg-background overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface">
            <span className="flex-1 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Nome
            </span>
            <span className="w-25 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Matrícula
            </span>
            <span className="w-28 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Perfil
            </span>
            <span className="w-24 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Status
            </span>
            <span className="w-28 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Concluído em
            </span>
            <span className="w-24 text-xs font-semibold text-text-secondary font-(family-name:--font-inter)]">
              Ações
            </span>
          </div>
          {filtered.map((row) => (
            <StudentRow key={row.studentId} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentRow({ row }: { row: StudentAssessment }) {
  const router = useRouter();
  const profileStyle = row.profile ? PROFILE_COLORS[row.profile] : null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-border-light">
      <span className="flex-1 text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {row.studentName}
      </span>
      <span className="w-25 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.studentRegistration || "—"}
      </span>
      <div className="w-28">
        {row.profile && profileStyle ? (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: profileStyle.bg,
              color: profileStyle.text,
            }}
          >
            {row.profile}
          </span>
        ) : (
          <span className="text-xs text-text-muted font-(family-name:--font-inter)]">
            —
          </span>
        )}
      </div>
      <div className="w-24">
        {row.assessmentId ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: row.tierColor || "#6B7280" }}
          >
            {row.tierLabel}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface text-text-secondary">
            Pendente
          </span>
        )}
      </div>
      <span className="w-28 text-sm text-text-secondary font-(family-name:--font-inter)]">
        {row.completedAt
          ? new Date(row.completedAt).toLocaleDateString("pt-BR")
          : "—"}
      </span>
      <div className="w-24">
        {row.assessmentId ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/report/${row.assessmentId}`)}
          >
            <FileText size={14} className="mr-1" />
            Ver
          </Button>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
      </div>
    </div>
  );
}
