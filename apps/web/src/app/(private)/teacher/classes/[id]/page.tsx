"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const PAGE_SIZE = 9;

interface StudentRow {
  studentId: string;
  studentName: string;
  studentRegistration: string;
  assessmentId: string | null;
  instrument: string | null;
  profile: string | null;
  tier: string | null;
  tierLabel: string | null;
  tierColor: string | null;
  profileColor: string | null;
  completedAt: string | null;
}

export default function ClassStudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classId } = use(params);
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
        if (!studentsRes.ok) {
          const body = await studentsRes.json();
          throw new Error(body.error || "Erro ao carregar alunos");
        }
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);

        if (classRes.ok) {
          const classData = await classRes.json();
          setClassName(classData.name || "");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [classId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {error}
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

  const filtered = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentRegistration || "").includes(search),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/teacher/dashboard"
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline w-fit"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Voltar para Dashboard
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          {className || "Turma"}
        </h1>
        <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
          {students.length} alunos matriculados
        </p>
      </div>

      <div className="relative w-full">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar aluno por nome ou matrícula"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-border-light bg-background pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted font-(family-name:--font-inter)] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="rounded-lg border border-border-light bg-background overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_140px_140px_80px] items-center h-12 px-4 bg-surface border-b border-border-light">
          {["Nome", "Matrícula", "Status", "Perfil", ""].map((col) => (
            <span
              key={col || "action"}
              className="text-xs font-semibold text-text-secondary uppercase tracking-wide font-(family-name:--font-inter)]"
            >
              {col}
            </span>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
              Nenhum aluno encontrado.
            </p>
          </div>
        ) : (
          paginated.map((student) => (
            <div
              key={student.studentId}
              className="grid grid-cols-[1fr_140px_140px_140px_80px] items-center h-13 px-4 border-b border-border-light last:border-b-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent shrink-0">
                  <span className="text-xs font-semibold text-white font-(family-name:--font-poppins)]">
                    {student.studentName.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
                  {student.studentName}
                </span>
              </div>

              <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                {student.studentRegistration || "—"}
              </span>

              <div>
                <Badge variant={student.profile ? "success" : "warning"}>
                  {student.profile ? "Completo" : "Pendente"}
                </Badge>
              </div>

              <div>
                {student.profile && student.profileColor ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold font-(family-name:--font-inter)]"
                    style={{
                      backgroundColor: student.profileColor + "15",
                      color: student.profileColor,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: student.profileColor }}
                      aria-hidden="true"
                    />
                    {student.profile}
                  </span>
                ) : (
                  <span className="text-xs text-text-muted font-(family-name:--font-inter)]">
                    —
                  </span>
                )}
              </div>

              <div>
                {student.assessmentId && (
                  <Link
                    href={`/report/${student.assessmentId}/manager`}
                    className="text-xs font-medium text-primary no-underline hover:underline"
                  >
                    Ver
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer",
                page === currentPage
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface",
              ].join(" ")}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Próxima
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
